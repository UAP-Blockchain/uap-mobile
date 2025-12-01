import api from "@/config/axios";
import type {
  SlotAttendanceDto,
  StudentAttendanceDto,
} from "@/types/attendance";

const baseUrl = "";

export const TeacherAttendanceServices = {
  /**
   * Lấy thông tin điểm danh cho một slot
   * GET /api/slots/{slotId}/attendance
   */
  getSlotAttendance: async (slotId: string): Promise<SlotAttendanceDto> => {
    const response = await api.get<{
      success: boolean;
      data: SlotAttendanceDto;
    }>(`/slots/${slotId}/attendance`);

    if (!response.data.success) {
      throw new Error("Không thể tải dữ liệu điểm danh.");
    }

    return response.data.data;
  },

  /**
   * Lần đầu điểm danh cho slot
   * POST /api/slots/{slotId}/attendance
   */
  takeSlotAttendance: async (
    slotId: string,
    students: StudentAttendanceDto[]
  ): Promise<void> => {
    await api.post(`/slots/${slotId}/attendance`, { students });
  },

  /**
   * Cập nhật điểm danh cho slot đã điểm danh
   * PUT /api/slots/{slotId}/attendance
   */
  updateSlotAttendance: async (
    slotId: string,
    students: StudentAttendanceDto[]
  ): Promise<void> => {
    await api.put(`/slots/${slotId}/attendance`, { students });
  },

  /**
   * Đánh dấu tất cả có mặt
   * POST /api/slots/{slotId}/attendance/mark-all-present
   */
  markAllPresent: async (slotId: string): Promise<void> => {
    await api.post(`/slots/${slotId}/attendance/mark-all-present`);
  },

  /**
   * Đánh dấu tất cả vắng
   * POST /api/slots/{slotId}/attendance/mark-all-absent
   */
  markAllAbsent: async (slotId: string): Promise<void> => {
    await api.post(`/slots/${slotId}/attendance/mark-all-absent`);
  },
};


