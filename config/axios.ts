import { setAuthData } from "@/lib/features/loginSlice";
import { store } from "@/lib/store";
import axios from "axios";

// Đồng bộ với web: dùng đúng URL API; loại bỏ dấu "/" cuối để tránh // khi ghép path
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  "https://uap-blockchain.azurewebsites.net/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Giữ refreshPromise ngoài interceptor để tránh tạo nhiều request refresh song song
let refreshPromise: Promise<any> | null = null;

// Add a request interceptor
api.interceptors.request.use(
  async function (config) {
    //chạy trước khi call api
    const token = store.getState().auth.accessToken;
    const refreshToken = store.getState().auth.refreshToken;
    
    // Skip token check for login and other public endpoints
    const isPublicEndpoint = config.url?.includes("/login") || 
                            config.url?.includes("/refresh-token") ||
                            config.url?.includes("/send-otp") ||
                            config.url?.includes("/reset-password") ||
                            config.url?.includes("/logout");
    
    if (!token && !isPublicEndpoint) {
      return Promise.reject(new Error("No token"));
    }
    
    if (!token) {
      return config; // Allow public endpoints without token
    }
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));
      const currentTime = Math.floor(Date.now() / 1000);
      const expDate = payload.exp;
      const timeLeft = expDate - currentTime;
      const timeLeftInMinutes = Math.floor(timeLeft / 60);
      // CHỈ refresh token, không logout
      if (timeLeftInMinutes > 0 && timeLeftInMinutes < 8) {
        if (!refreshPromise) {
          try {
            const refreshUrl = `${API_BASE_URL}/Auth/refresh-token`;
            refreshPromise = axios
              .post(refreshUrl, {
                refreshToken: refreshToken,
              })
              .finally(() => {
                refreshPromise = null;
              });

            const res = await refreshPromise;
            store.dispatch(setAuthData(res.data));
            config.headers.Authorization = `Bearer ${res.data.accessToken}`;
          } catch (refreshError) {
            console.log("refreshError:", refreshError);
            config.headers.Authorization = `Bearer ${token}`;
          }
        } else {
          // Có refresh đang chạy: đợi kết quả để dùng token mới
          const res = await refreshPromise;
          config.headers.Authorization = `Bearer ${
            res?.data?.accessToken || token
          }`;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (decodeError) {
      console.log("decodeError:", decodeError);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default api;
