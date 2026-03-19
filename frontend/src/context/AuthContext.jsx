import { createContext, useContext, useMemo, useState } from "react";

export const DEFAULT_AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDUH5FECen9HBkeywYTdApXoqJduBgRCpdOKWdAXLgutFlXlxWAP1Oyd7a4RyO-ZkkRN0o4Bc4k3WPUVkKVzG3iNNDjOg7r_vCKPWSpHjLbWBv0oyv4iTeK2UbDh5nE2RuvXhWOxmI73xmUgAbk6FKtlYsirHQhIyaBer1luP34d7-0OrGFyGCYFwm4y3e33k1qnJoCZfXy1MKqbMNulM2Wz4Do4kziw1KkdluzkLTtyOeT-4A2tc4jJ0DKCYMn7YRU0AxyuKnxfTs";

const resolveAvatar = (avatar) => {
  if (typeof avatar === "string" && avatar.trim()) {
    return avatar.trim();
  }

  return DEFAULT_AVATAR_URL;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);

  const loginUser = (loggedUser) => {
    setAuthUser({
      email: loggedUser?.email || "",
      role: loggedUser?.role || "",
      avatar: resolveAvatar(loggedUser?.avatar),
    });
  };

  const logoutUser = () => {
    setAuthUser(null);
  };

  const value = useMemo(
    () => ({
      authUser,
      isLoggedIn: Boolean(authUser),
      loginUser,
      logoutUser,
      defaultAvatar: DEFAULT_AVATAR_URL,
    }),
    [authUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
