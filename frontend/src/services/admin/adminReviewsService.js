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

export const getAdminReviews = async ({
  page = 0,
  size = 10,
  rating = "",
  vehicleId = "",
} = {}) => {
  try {
    const response = await apiClient.get("/reviews/admin", {
      params: buildParams({
        page,
        size,
        rating,
        vehicleId,
      }),
    });

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load reviews"));
  }
};

export const getAdminReviewDetail = async (id) => {
  try {
    const response = await apiClient.get(`/reviews/admin/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load review detail"));
  }
};

export const deleteAdminReview = async (id) => {
  try {
    const response = await apiClient.delete(`/reviews/admin/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to delete review"));
  }
};
