import apiClient from "../../api/axios";

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

export const getMyLicenseProfile = async () => {
  try {
    const response = await apiClient.get("/users/me/license");
    return response?.data?.data || null;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không thể tải thông tin giấy phép lái xe."),
    );
  }
};

export const submitMyLicenseProfile = async ({
  licenseNumber,
  frontImage,
  backImage,
}) => {
  try {
    const formData = new FormData();
    formData.append("licenseNumber", String(licenseNumber || "").trim());

    if (frontImage) {
      formData.append("frontImage", frontImage);
    }

    if (backImage) {
      formData.append("backImage", backImage);
    }

    const response = await apiClient.post("/users/me/license", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response?.data?.data || null;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không thể gửi hồ sơ giấy phép lái xe."),
    );
  }
};

const profileLicenseService = {
  getMyLicenseProfile,
  submitMyLicenseProfile,
};

export default profileLicenseService;
