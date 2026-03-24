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

export const getAdminBookings = async ({
  status = "",
  email = "",
  locationId = "",
  fromDate = "",
  toDate = "",
  page = 1,
  size = 10,
} = {}) => {
  try {
    const response = await apiClient.get("/bookings/admin", {
      params: buildParams({
        status,
        email,
        locationId,
        fromDate,
        toDate,
        page,
        size,
      }),
    });

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load bookings"));
  }
};

export const getAdminBookingDetail = async (id) => {
  try {
    const response = await apiClient.get(`/bookings/admin/${id}`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load booking detail"));
  }
};

export const completeAdminBooking = async (id) => {
  try {
    const response = await apiClient.put(`/bookings/admin/${id}/complete`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to complete booking"));
  }
};

export const getBookingCountStats = async ({
  groupBy = "month",
  fromDate = "",
  toDate = "",
} = {}) => {
  try {
    const response = await apiClient.get("/bookings/admin/stats/count", {
      params: buildParams({ groupBy, fromDate, toDate }),
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load booking count stats"));
  }
};

export const getBookingRevenueStats = async ({
  groupBy = "month",
  fromDate = "",
  toDate = "",
} = {}) => {
  try {
    const response = await apiClient.get("/bookings/admin/stats/revenue", {
      params: buildParams({ groupBy, fromDate, toDate }),
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load booking revenue stats"));
  }
};

export const getBookingStatusStats = async ({
  fromDate = "",
  toDate = "",
} = {}) => {
  try {
    const response = await apiClient.get("/bookings/admin/stats/status", {
      params: buildParams({ fromDate, toDate }),
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load booking status stats"));
  }
};

export const getTopBookedVehicles = async ({ limit = 5 } = {}) => {
  try {
    const response = await apiClient.get("/bookings/admin/stats/top", {
      params: { limit },
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load top booked vehicles"));
  }
};
