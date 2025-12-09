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

const buildStatisticsFromRecords = (
  records: AttendanceDto[]
): AttendanceStatisticsDto => {
  const totalSlots = records.length;
  const presentCount = records.filter((r) => r.isPresent).length;
  const excusedCount = records.filter((r) => !r.isPresent && r.isExcused).length;
  const absentCount = records.filter((r) => !r.isPresent && !r.isExcused).length;
  const attendanceRate =
    totalSlots === 0 ? 0 : Math.round((presentCount / totalSlots) * 100);

  const first = records[0];
  return {
    studentId: first?.studentId ?? "",
    studentCode: first?.studentCode ?? "",
    studentName: first?.studentName ?? "",
    totalSlots,
    presentCount,
    absentCount,
    excusedCount,
    attendanceRate,
    attendanceRecords: records,
  };
};

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
    try {
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
    } catch (error: any) {
      // Backend trả 500, tự tính dựa trên danh sách điểm danh để không chặn UI
      const status = error?.response?.status as number | undefined;
      if (!status || status >= 500) {
        const records = await StudentAttendanceServices.getMyAttendance(
          classId ? { ClassId: classId } : undefined
        );
        return buildStatisticsFromRecords(records);
      }
      throw error;
    }
  },
};


