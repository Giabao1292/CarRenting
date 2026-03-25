import apiClient from "../../api/axios";

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data ||
  error?.message ||
  fallbackMessage;

const unwrapResponse = (response) => response?.data?.data ?? response?.data;

const buildParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

export const getAdminLicenses = async ({
  keyword = "",
  status = "",
  page = 0,
  size = 10,
} = {}) => {
  try {
    const response = await apiClient.get("/licenses/admin", {
      params: buildParams({
        keyword,
        status,
        page,
        size,
      }),
    });

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load licenses"));
  }
};

export const getAdminLicenseDetail = async (id) => {
  try {
    const response = await apiClient.get(`/licenses/admin/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load license detail"));
  }
};

export const approveAdminLicense = async (id) => {
  try {
    const response = await apiClient.put(`/licenses/admin/${id}/approve`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to approve license"));
  }
};

export const rejectAdminLicense = async (id, reason) => {
  try {
    const response = await apiClient.put(`/licenses/admin/${id}/reject`, {
      reason,
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to reject license"));
  }
};
