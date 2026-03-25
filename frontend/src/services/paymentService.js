import apiClient from "../api/axios";

const CHECKOUT_CONTEXT_KEY = "stripeCheckoutContextMap";

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

export const createCheckoutSession = async (payload) => {
  try {
    const response = await apiClient.post(
      "/payments/checkout/session",
      payload,
    );

    return response?.data?.data || null;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không thể tạo phiên thanh toán Stripe."),
    );
  }
};

export const getBookingPaymentStatus = async (bookingId) => {
  try {
    const response = await apiClient.get(
      `/payments/booking/${bookingId}/status`,
    );
    return response?.data?.data || null;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Không thể tải trạng thái thanh toán."),
    );
  }
};

export const saveCheckoutSessionContext = ({ sessionId, bookingId }) => {
  if (!sessionId || !bookingId) {
    return;
  }

  try {
    const rawValue = localStorage.getItem(CHECKOUT_CONTEXT_KEY);
    const currentMap = rawValue ? JSON.parse(rawValue) : {};
    const nextMap = {
      ...currentMap,
      [sessionId]: bookingId,
    };
    localStorage.setItem(CHECKOUT_CONTEXT_KEY, JSON.stringify(nextMap));
  } catch {
    // Ignore storage failures to avoid blocking checkout.
  }
};

export const getBookingIdBySessionId = (sessionId) => {
  if (!sessionId) {
    return null;
  }

  try {
    const rawValue = localStorage.getItem(CHECKOUT_CONTEXT_KEY);
    if (!rawValue) {
      return null;
    }

    const contextMap = JSON.parse(rawValue);
    const bookingId = Number(contextMap?.[sessionId] || 0);
    return Number.isFinite(bookingId) && bookingId > 0 ? bookingId : null;
  } catch {
    return null;
  }
};

export const clearCheckoutSessionContext = (sessionId) => {
  if (!sessionId) {
    return;
  }

  try {
    const rawValue = localStorage.getItem(CHECKOUT_CONTEXT_KEY);
    if (!rawValue) {
      return;
    }

    const currentMap = JSON.parse(rawValue);
    if (!currentMap || typeof currentMap !== "object") {
      return;
    }

    delete currentMap[sessionId];
    localStorage.setItem(CHECKOUT_CONTEXT_KEY, JSON.stringify(currentMap));
  } catch {
    // Ignore storage failures.
  }
};

const paymentService = {
  createCheckoutSession,
  getBookingPaymentStatus,
  saveCheckoutSessionContext,
  getBookingIdBySessionId,
  clearCheckoutSessionContext,
};

export default paymentService;
