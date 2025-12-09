import api from "@/config/axios";
import type {
  WeeklyScheduleDto,
  WeeklyScheduleResponse,
} from "@/types/schedule";

const baseUrl = "";

export interface TeacherProfileDto {
  id: string;
  teacherCode: string;
  fullName: string;
  email: string;
  hireDate: string;
  specialization?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  classes: TeacherClassSummaryDto[];
  totalClasses: number;
  totalStudents: number;
  specializations?: SpecializationDto[];
}

export interface TeacherClassSummaryDto {
  classId: string;
  classCode: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  semesterName: string;
  totalStudents: number;
  totalSlots: number;
}

export interface SpecializationDto {
  id: string;
  code: string;
  name: string;
}

export const TeacherServices = {
  /**
   * Get current teacher's weekly schedule
   * Endpoint: GET /api/teachers/me/schedule
   * Query params: weekStartDate (optional ISO string)
   */
  getMyWeeklySchedule: async (
    weekStartDate?: string
  ): Promise<WeeklyScheduleDto> => {
    const params = weekStartDate ? { weekStartDate } : undefined;
    const response = await api.get<WeeklyScheduleResponse>(
      `/teachers/me/schedule`,
      { params }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Không thể lấy lịch giảng dạy tuần."
      );
    }

    return response.data.data;
  },

  /**
   * Get current teacher's profile
   * Endpoint: GET /api/teachers/me
   */
  getMyProfile: async (): Promise<TeacherProfileDto> => {
    const response = await api.get<TeacherProfileDto>("/teachers/me");
    return response.data;
  },
};

