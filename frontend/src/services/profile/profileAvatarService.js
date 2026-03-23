import apiClient from "../../api/axios";

export const uploadProfileAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/upload/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const avatarUrl = response?.data?.data;

  if (typeof avatarUrl !== "string" || !avatarUrl.trim()) {
    const message = response?.data?.message || "Upload avatar failed.";
    throw new Error(message);
  }

  return avatarUrl;
};
