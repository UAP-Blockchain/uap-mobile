import api from "@/config/axios";
import type {
  CurriculumRoadmapSummaryDto,
  CurriculumSemesterDto,
  StudentRoadmapDto,
} from "@/types/roadmap";

const baseUrl = "/students";

export const RoadmapServices = {
  /**
   * Lấy lộ trình V2 - tổng quan (summary)
   * Endpoint BE: GET /api/students/me/curriculum-roadmap/summary
   */
  getMyCurriculumRoadmapSummary: async (): Promise<CurriculumRoadmapSummaryDto> => {
    const response = await api.get<CurriculumRoadmapSummaryDto>(
      `${baseUrl}/me/curriculum-roadmap/summary`
    );
    return response.data;
  },

  /**
   * Lấy chi tiết lộ trình theo kỳ (lazy load)
   * Endpoint BE: GET /api/students/me/curriculum-roadmap/semesters?semesterNumber={n}
   */
  getMyCurriculumSemester: async (
    semesterNumber: number
  ): Promise<CurriculumSemesterDto> => {
    const response = await api.get<CurriculumSemesterDto>(
      `${baseUrl}/me/curriculum-roadmap/semesters`,
      { params: { semesterNumber } }
    );
    return response.data;
  },

  /**
   * Legacy: lộ trình tổng quan cũ (nếu cần dùng nơi khác)
   * Endpoint BE: GET /api/students/me/roadmap
   */
  getMyRoadmap: async (): Promise<StudentRoadmapDto> => {
    const response = await api.get<StudentRoadmapDto>(`${baseUrl}/me/roadmap`);
    return response.data;
  },
};


