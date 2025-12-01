import api from "@/config/axios";
import type {
  WeeklyScheduleDto,
  WeeklyScheduleResponse,
} from "@/types/schedule";

const baseUrl = "";

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
};

