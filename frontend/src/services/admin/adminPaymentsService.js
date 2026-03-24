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

export const getAdminPayments = async ({
  providerTxnId = "",
  provider = "",
  status = "",
  bookingId = "",
  userId = "",
  fromDate = "",
  toDate = "",
  page = 0,
  size = 10,
  sortBy = "createdAt",
  sortDir = "desc",
} = {}) => {
  try {
    const response = await apiClient.get("/payments/admin", {
      params: buildParams({
        providerTxnId,
        provider,
        status,
        bookingId,
        userId,
        fromDate,
        toDate,
        page,
        size,
        sortBy,
        sortDir,
      }),
    });

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load payments"));
  }
};

export const getRevenueToday = async () => {
  try {
    const response = await apiClient.get("/payments/admin/revenue/today");
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load today's revenue"));
  }
};

export const getRevenueByDate = async (date) => {
  try {
    const response = await apiClient.get("/payments/admin/revenue/date", {
      params: { date },
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load revenue by date"));
  }
};

export const getMonthlyRevenue = async (year) => {
  try {
    const response = await apiClient.get("/payments/admin/revenue/monthly", {
      params: { year },
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load monthly revenue"));
  }
};

export const getOwnerRevenue = async ({ fromDate = "", toDate = "" } = {}) => {
  try {
    const response = await apiClient.get("/payments/admin/revenue/owners", {
      params: buildParams({ fromDate, toDate }),
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load owner revenue"));
  }
};
