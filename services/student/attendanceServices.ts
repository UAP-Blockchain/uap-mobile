import api from "@/config/axios";
import type {
  AttendanceDto,
  AttendanceFilterRequest,
  AttendanceStatisticsDto,
} from "@/types/attendance";

interface AttendanceListResponse {
  success: boolean;
  message?: string;
  data: AttendanceDto[];
}

interface AttendanceStatsResponse {
  success: boolean;
  data: AttendanceStatisticsDto;
}

const baseUrl = "/students";

export const StudentAttendanceServices = {
  /**
   * Lấy lịch sử điểm danh của sinh viên hiện tại
   * GET /api/students/me/attendance
   */
  getMyAttendance: async (
    params?: AttendanceFilterRequest
  ): Promise<AttendanceDto[]> => {
    const response = await api.get<AttendanceListResponse>(
      `${baseUrl}/me/attendance`,
      { params }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Không thể tải dữ liệu điểm danh."
      );
    }

    return response.data.data;
  },

  /**
   * Lấy thống kê điểm danh tổng quan của sinh viên (tuỳ chọn theo lớp)
   * GET /api/students/me/attendance/statistics
   */
  getMyAttendanceStatistics: async (
    classId?: string
  ): Promise<AttendanceStatisticsDto> => {
    const response = await api.get<AttendanceStatsResponse>(
      `${baseUrl}/me/attendance/statistics`,
      {
        params: classId ? { classId } : undefined,
      }
    );

    if (!response.data.success) {
      throw new Error("Không thể tải thống kê điểm danh.");
    }

    return response.data.data;
  },
};


