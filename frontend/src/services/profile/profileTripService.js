import apiClient from "../../api/axios";

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

export const getMyTrips = async () => {
  try {
    const response = await apiClient.get("/bookings/my-trips");
    const trips = response?.data?.data;
    return Array.isArray(trips) ? trips : [];
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không thể tải danh sách chuyến của bạn."),
    );
  }
};

const profileTripService = {
  getMyTrips,
};

export default profileTripService;
