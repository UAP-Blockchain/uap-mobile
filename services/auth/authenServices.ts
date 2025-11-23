import api from "@/config/axios";
import { LoginFormValues } from "@/types/auth/login";

const url = "/Auth";

export interface SendOtpRequest {
  email: string;
  purpose?: string;
}

export interface ResetPasswordWithOtpRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OtpResponse {
  message: string;
}

export const AuthenServices = {
  loginUser: (values: LoginFormValues) => {
    // Backend expects Email and Password
    return api.post(`${url}/login`, {
      Email: values.email,
      Password: values.password,
    });
  },
  sendOtp: (request: SendOtpRequest): Promise<OtpResponse> => {
    return api.post(`${url}/send-otp`, {
      Email: request.email,
      Purpose: request.purpose || "PasswordReset",
    });
  },
  resetPasswordWithOtp: (
    request: ResetPasswordWithOtpRequest
  ): Promise<OtpResponse> => {
    return api.post(`${url}/reset-password-with-otp`, {
      Email: request.email,
      OtpCode: request.otpCode,
      NewPassword: request.newPassword,
      ConfirmPassword: request.confirmPassword,
    });
  },
};
