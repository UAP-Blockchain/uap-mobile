import api from "@/config/axios";
import type { StudentCredentialDto } from "@/types/credential";

const baseUrl = "/students/me/credentials";

export const StudentCredentialServices = {
  /**
   * Lấy danh sách chứng chỉ của sinh viên hiện tại
   * Backend: GET /api/students/me/credentials
   */
  getMyCredentials: async (): Promise<StudentCredentialDto[]> => {
    const response = await api.get<StudentCredentialDto[]>(baseUrl);
    return response.data;
  },
};


