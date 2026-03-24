import apiClient from "../api/axios";
import { saveToken } from "../utils/storage";

export const login = async ({ email, password }) => {
  const response = await apiClient.post("/auth/login", {
    email,
    password,
  });

  const payload = response?.data?.data;

  if (!payload?.accessToken || !payload?.refreshToken) {
    throw new Error("Token không hợp lệ từ server.");
  }

  saveToken(payload.accessToken, payload.refreshToken);

  return {
    name: payload.name || payload.fullName || payload.displayName || email,
    role: payload.role,
    email,
    avatar: payload.avatar,
  };
};

const authService = {
  login,
};

export default authService;
