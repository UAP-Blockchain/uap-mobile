import api from "@/config/axios";
import { LoginFormValues } from "@/types/auth/login";

const url = "/Auth";
export const AuthenServices = {
  loginUser: (values: LoginFormValues) => {
    // Backend expects Email and Password
    return api.post(`${url}/login`, {
      Email: values.username, // Map username field to Email
      Password: values.password,
    });
  },
};
