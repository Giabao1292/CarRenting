import apiClient, { BACKEND_ORIGIN } from "../api/axios";
import { saveToken } from "../utils/storage";

const GOOGLE_LOGIN_TIMEOUT_MS = 90000;
const GOOGLE_POPUP_CHECK_INTERVAL_MS = 300;

const openGooglePopup = () => {
  const width = 520;
  const height = 720;
  const left = Math.max(0, Math.round((window.screen.width - width) / 2));
  const top = Math.max(0, Math.round((window.screen.height - height) / 2));

  return window.open(
    `${BACKEND_ORIGIN}/oauth2/authorization/google`,
    "google-login-popup",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
  );
};

const normalizeGoogleError = (error) => {
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) return serverMessage;

  const message = error?.message || "";
  if (message.includes("Network Error")) {
    return "Không thể kết nối tới máy chủ đăng nhập Google.";
  }

  return message || "Đăng nhập Google thất bại, vui lòng thử lại.";
};

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

export const loginWithGoogle = async () => {
  if (typeof window === "undefined") {
    throw new Error("Google login chỉ hỗ trợ trên trình duyệt.");
  }

  const popup = openGooglePopup();
  if (!popup) {
    throw new Error(
      "Trình duyệt đang chặn popup. Vui lòng bật popup và thử lại.",
    );
  }

  return new Promise((resolve, reject) => {
    let popupWatch = null;
    let timeoutId = null;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      if (popupWatch) {
        clearInterval(popupWatch);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    const resolveWithPayload = (payload) => {
      if (!payload?.accessToken || !payload?.refreshToken) {
        cleanup();
        reject(new Error("Token không hợp lệ từ server."));
        return;
      }

      saveToken(payload.accessToken, payload.refreshToken);

      cleanup();
      resolve({
        name:
          payload.name ||
          payload.fullName ||
          payload.displayName ||
          payload.email ||
          "Người dùng",
        role: payload.role,
        email: payload.email || "",
        avatar: payload.avatar,
      });
    };

    const handleMessage = (event) => {
      if (event.origin !== BACKEND_ORIGIN) {
        return;
      }

      const data = event.data || {};
      if (data.type === "GOOGLE_AUTH_SUCCESS") {
        resolveWithPayload(data.data);
        return;
      }

      if (data.type === "GOOGLE_AUTH_ERROR") {
        cleanup();
        reject(new Error(data.message || "Đăng nhập Google thất bại."));
      }
    };

    window.addEventListener("message", handleMessage);

    popupWatch = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error("Bạn đã đóng cửa sổ đăng nhập Google."));
      }
    }, GOOGLE_POPUP_CHECK_INTERVAL_MS);

    timeoutId = window.setTimeout(() => {
      cleanup();
      if (!popup.closed) {
        popup.close();
      }
      reject(
        new Error("Đăng nhập Google quá thời gian chờ. Vui lòng thử lại."),
      );
    }, GOOGLE_LOGIN_TIMEOUT_MS);
  }).catch((error) => {
    throw new Error(normalizeGoogleError(error));
  });
};

const authService = {
  login,
  loginWithGoogle,
};

export default authService;
