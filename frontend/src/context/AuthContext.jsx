import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  getAuthUser,
  removeAuthUser,
  removeToken,
  saveAuthUser,
} from "../utils/storage";

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
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = getAuthUser();
    if (!storedUser) return null;

    return {
      email: storedUser.email,
      role: storedUser.role,
      avatar: resolveAvatar(storedUser.avatar),
    };
  });

  const loginUser = (loggedUser) => {
    const nextAuthUser = {
      email: loggedUser?.email || "",
      role: loggedUser?.role || "",
      avatar: resolveAvatar(loggedUser?.avatar),
    };

    setAuthUser(nextAuthUser);
    saveAuthUser(nextAuthUser);
  };

  const logoutUser = () => {
    removeToken();
    removeAuthUser();
    setAuthUser(null);
  };

  const updateUserAvatar = useCallback((avatarUrl) => {
    setAuthUser((prevUser) => {
      if (!prevUser) return prevUser;

      const nextAuthUser = {
        ...prevUser,
        avatar: resolveAvatar(avatarUrl),
      };

      saveAuthUser(nextAuthUser);
      return nextAuthUser;
    });
  }, []);

  const value = useMemo(
    () => ({
      authUser,
      isLoggedIn: Boolean(authUser),
      loginUser,
      logoutUser,
      updateUserAvatar,
      defaultAvatar: DEFAULT_AVATAR_URL,
    }),
    [authUser, updateUserAvatar],
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
