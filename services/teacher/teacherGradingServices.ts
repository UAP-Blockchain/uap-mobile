import api from "@/config/axios";

// Types
export interface TeachingClass {
  classId: string;
  classCode: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  semesterId?: string;
  semesterName: string;
  totalStudents: number;
  totalSlots?: number;
  currentEnrollment?: number;
  status?: string;
}

export interface ClassStudent {
  studentId: string;
  studentCode: string;
  fullName: string;
  email?: string;
}

export interface ClassDetail {
  id: string;
  classCode: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  credits?: number;
  semesterId: string;
  semesterName: string;
  semesterStartDate?: string;
  semesterEndDate?: string;
  room?: string;
  students: ClassStudent[];
}

export interface GradeComponent {
  id: string;
  name: string;
  weightPercent: number;
  maxScore?: number;
  description?: string;
}

export interface GradeData {
  studentId: string;
  gradeComponentId: string;
  gradeId: string;
  score: number;
}

export interface UpdateGradesRequest {
  grades: Array<{
    gradeId: string;
    score: number;
  }>;
}

const baseUrl = "";

export const TeacherGradingServices = {
  /**
   * Get classes taught by current teacher
   * GET /api/teachers/me/classes
   */
  getTeacherClasses: async (): Promise<TeachingClass[]> => {
    const response = await api.get("/teachers/me/classes");
    const payload = response.data;

    const extractArray = (input: unknown): Record<string, unknown>[] => {
      if (Array.isArray(input)) return input as Record<string, unknown>[];
      if (input && typeof input === "object") {
        const obj = input as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
        if (Array.isArray(obj.classes)) return obj.classes as Record<string, unknown>[];
      }
      return [];
    };

    const rawClasses = extractArray(payload);

    const toStringSafe = (value: unknown): string => {
      if (typeof value === "string") return value;
      if (value === null || value === undefined) return "";
      return String(value);
    };

    const toNumberSafe = (value: unknown): number => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return rawClasses.map((cls) => {
      const subject =
        (cls.subject as Record<string, unknown> | undefined) ?? undefined;
      const semester =
        (cls.semester as Record<string, unknown> | undefined) ?? undefined;

      return {
        classId: toStringSafe(cls.id ?? cls.classId),
        classCode: toStringSafe(cls.classCode),
        subjectName: toStringSafe(
          cls.subjectName ?? subject?.name ?? subject?.subjectName
        ),
        subjectCode: toStringSafe(
          cls.subjectCode ?? subject?.code ?? subject?.subjectCode
        ),
        credits: toNumberSafe(cls.credits ?? subject?.credits),
        semesterId: toStringSafe(cls.semesterId ?? semester?.id),
        semesterName: toStringSafe(
          cls.semesterName ?? semester?.name ?? semester?.semesterName
        ),
        totalStudents: toNumberSafe(cls.totalStudents ?? cls.currentEnrollment),
        totalSlots: toNumberSafe(cls.totalSlots ?? cls.maxEnrollment),
        currentEnrollment: toNumberSafe(
          cls.currentEnrollment ?? cls.totalStudents
        ),
        status: toStringSafe(cls.status ?? cls.classStatus),
      } as TeachingClass;
    });
  },

  /**
   * Get class details including students
   * GET /api/Classes/{classId}
   */
  getClassById: async (classId: string): Promise<ClassDetail> => {
    const response = await api.get<ClassDetail>(`/Classes/${classId}`);
    return response.data;
  },

  /**
   * Get grade components for a subject
   * GET /api/grade-components?subjectId={subjectId}
   */
  getGradeComponents: async (subjectId?: string): Promise<GradeComponent[]> => {
    const response = await api.get<GradeComponent[]>("/grade-components", {
      params: subjectId ? { subjectId } : undefined,
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get existing grades for a class
   * GET /api/Classes/{classId}/grades
   */
  getClassGrades: async (classId: string): Promise<GradeData[]> => {
    const response = await api.get<{
      students?: Array<{
        studentId: string;
        grades?: Array<{
          gradeId?: string;
          gradeComponentId: string;
          score?: number;
        }>;
      }>;
    }>(`/Classes/${classId}/grades`);

    const grades: GradeData[] = [];

    if (response.data?.students) {
      response.data.students.forEach((student) => {
        if (student.grades) {
          student.grades.forEach((grade) => {
            if (grade.gradeId) {
              const normalizedScore =
                grade.score !== undefined && grade.score !== null
                  ? Number(grade.score)
                  : 0;

              grades.push({
                studentId: student.studentId,
                gradeComponentId: grade.gradeComponentId,
                gradeId: grade.gradeId,
                score: normalizedScore,
              });
            }
          });
        }
      });
    }

    return grades;
  },

  /**
   * Update grades for a student
   * PUT /api/Grades/{gradeId} (called for each grade)
   */
  updateStudentGrades: async (request: UpdateGradesRequest): Promise<void> => {
    if (!request.grades || request.grades.length === 0) {
      return;
    }

    await Promise.all(
      request.grades.map((grade) =>
        api.put(`/Grades/${grade.gradeId}`, {
          score: grade.score,
        })
      )
    );
  },
};

