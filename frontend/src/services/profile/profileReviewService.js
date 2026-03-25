import apiClient from "../../api/axios";

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

export const createReview = async ({
  bookingId,
  vehicleId,
  rating,
  comment,
}) => {
  try {
    await apiClient.post("/reviews", {
      bookingId,
      vehicleId,
      rating,
      comment,
    });
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không thể gửi đánh giá. Vui lòng thử lại."),
    );
  }
};

const profileReviewService = {
  createReview,
};

export default profileReviewService;
