import api from "@/config/axios";
import type {
  WeeklyScheduleDto,
  WeeklyScheduleResponse,
} from "@/types/schedule";
import type { StudentDetailDto } from "@/types/student";

const url = "/students";

export const StudentServices = {
  /**
   * Lấy thông tin hồ sơ sinh viên hiện tại
   * Endpoint: GET /api/students/me
   */
  getCurrentStudentProfile: async (): Promise<StudentDetailDto> => {
    const response = await api.get<StudentDetailDto>(`${url}/me`);
    return response.data;
  },

  /**
   * Lấy thời khóa biểu tuần của sinh viên hiện tại
   * Endpoint: GET /api/students/me/schedule
   * Query params: weekStartDate (optional ISO string)
   */
  getMyWeeklySchedule: async (
    weekStartDate?: string
  ): Promise<WeeklyScheduleDto> => {
    const params = weekStartDate ? { weekStartDate } : undefined;
    const response = await api.get<WeeklyScheduleResponse>(
      `${url}/me/schedule`,
      { params }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Không thể lấy thời khóa biểu tuần."
      );
    }

    return response.data.data;
  },
};
