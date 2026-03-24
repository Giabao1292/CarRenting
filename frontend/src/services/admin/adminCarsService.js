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

export const getAdminCarSummary = async () => {
  try {
    const response = await apiClient.get("/cars/admin/summary");
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load car summary"));
  }
};

export const getAdminCars = async ({
  keyword = "",
  status = "",
  page = 0,
  size = 10,
} = {}) => {
  try {
    const response = await apiClient.get("/cars/admin", {
      params: buildParams({
        keyword,
        status,
        page,
        size,
      }),
    });

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load cars"));
  }
};

export const getAdminPendingCars = async ({ page = 0, size = 10 } = {}) => {
  try {
    const response = await apiClient.get("/cars/admin/pending", {
      params: { page, size },
    });

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load pending cars"));
  }
};

export const getAdminCarDetail = async (id) => {
  try {
    const response = await apiClient.get(`/cars/admin/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load car detail"));
  }
};

export const approveAdminCar = async (id) => {
  try {
    const response = await apiClient.put(`/cars/admin/${id}/approve`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to approve car"));
  }
};

export const rejectAdminCar = async (id, reason) => {
  try {
    const response = await apiClient.put(`/cars/admin/${id}/reject`, {
      reason,
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to reject car"));
  }
};

export const removeAdminCar = async (id) => {
  try {
    const response = await apiClient.put(`/cars/admin/${id}/remove`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to remove car"));
  }
};
