import { setAuthData } from "@/lib/features/loginSlice";
import { store } from "@/lib/store";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

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
                            config.url?.includes("/reset-password");
    
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
      let refreshPromise: Promise<any> | null = null;
      if (timeLeftInMinutes > 0 && timeLeftInMinutes < 8) {
        if (!refreshPromise) {
          try {
            refreshPromise = axios
              .post(
                `${process.env.EXPO_PUBLIC_API_URL}/v1/auth/refresh-token`,
                {
                  refreshToken: refreshToken,
                }
              )
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
