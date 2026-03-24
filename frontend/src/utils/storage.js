const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const AUTH_USER_KEY = "authUser";

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY) || "";

export const getRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_KEY) || "";

export const saveToken = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const removeToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const saveAuthUser = (authUser) => {
  if (!authUser) return;

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
};

export const getAuthUser = () => {
  const rawValue = localStorage.getItem(AUTH_USER_KEY);
  if (!rawValue) return null;

  try {
    const parsedUser = JSON.parse(rawValue);
    if (!parsedUser || typeof parsedUser !== "object") {
      return null;
    }

    return {
      email: parsedUser.email || "",
      role: parsedUser.role || "",
      avatar: parsedUser.avatar || "",
    };
  } catch {
    return null;
  }
};

export const removeAuthUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};
