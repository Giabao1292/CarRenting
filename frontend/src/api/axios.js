import axios from "axios";
import {
  getToken,
  getRefreshToken,
  saveToken,
  removeToken,
} from "../utils/storage";

const rawApiBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/i, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Gắn accessToken cho mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || "";

    const token = getToken();
    const noAuthPaths = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-token",
    ];

    // Không gắn token cho các request login/register/refresh-token
    if (token && !noAuthPaths.some((path) => requestUrl.includes(path))) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    const status = error.response ? error.response.status : null;
    const refreshToken = getRefreshToken(); // Lấy refreshToken ngay từ đầu

    if (
      originalRequest._retry ||
      (originalRequest.url || "").includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    // 2. Chỉ xử lý lỗi 401 VÀ khi có refreshToken
    if ((status === 401 || status === 403) && refreshToken) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại

      try {
        // Gọi refresh token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          null,
          {
            headers: {
              "X-Refresh-Token": refreshToken,
            },
          },
        );

        const newAccessToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;

        saveToken(newAccessToken, newRefreshToken); // Lưu token mới

        // Gắn token mới và gửi lại request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest); // Gửi lại request ban đầu
      } catch (refreshError) {
        // Nếu quá trình refresh token thất bại (refresh token hết hạn/không hợp lệ)
        removeToken(); // Xóa tất cả token
        // Chuyển hướng người dùng về trang đăng nhập nếu cần
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Đối với các lỗi khác (không phải 401, hoặc 401 nhưng không có refreshToken),
    // hoặc lỗi 401 mà không có originalRequest.response (ví dụ lỗi mạng),
    // hoặc lỗi 401 nhưng không có refresh token (người dùng chưa đăng nhập)
    return Promise.reject(error);
  },
);

export default apiClient;
