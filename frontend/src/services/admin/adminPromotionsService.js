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

export const getAdminPromotions = async ({
  keyword = "",
  page = 0,
  size = 10,
} = {}) => {
  try {
    const response = await apiClient.get("/promotions/view", {
      params: buildParams({ keyword, page, size }),
    });

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load promotions"));
  }
};

export const getAdminPromotionDetail = async (id) => {
  try {
    const response = await apiClient.get(`/promotions/me/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load promotion detail"));
  }
};

export const createAdminPromotion = async (payload) => {
  try {
    const response = await apiClient.post("/promotions/create", payload);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to create promotion"));
  }
};

export const updateAdminPromotion = async (id, payload) => {
  try {
    const response = await apiClient.put(`/promotions/update/${id}`, payload);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to update promotion"));
  }
};

export const deleteAdminPromotion = async (id) => {
  try {
    const response = await apiClient.delete(`/promotions/delete/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to delete promotion"));
  }
};
