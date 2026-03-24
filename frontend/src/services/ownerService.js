import apiClient from "../api/axios";

const normalizeOwnerType = (value) => {
  if (value === "business") {
    return "BUSINESS";
  }

  return "INDIVIDUAL";
};

const normalizeResidencyType = (value) => {
  if (value === "temporary") {
    return "TEMPORARY";
  }

  return "PERMANENT";
};

const buildOwnerPayload = (ownerData) => ({
  ownerType: normalizeOwnerType(ownerData.ownerType),
  residencyType: normalizeResidencyType(ownerData.residencyType),
  fullName: ownerData.fullName?.trim() || "",
  city: ownerData.city?.trim() || "",
  address: ownerData.address?.trim() || "",
  idNumber: ownerData.idNumber?.trim() || "",
});

export const registerOwner = async ({
  ownerData,
  idCardFrontFile,
  idCardBackFile,
}) => {
  const requestData = new FormData();
  requestData.append(
    "data",
    new Blob([JSON.stringify(buildOwnerPayload(ownerData))], {
      type: "application/json",
    }),
  );
  requestData.append("idCardFront", idCardFrontFile);
  requestData.append("idCardBack", idCardBackFile);

  const response = await apiClient.post("/owners", requestData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    code: response?.data?.code,
    message: response?.data?.message || "Đăng ký chủ xe thành công.",
    data: response?.data?.data,
  };
};

export const getOwnerStatus = async () => {
  const response = await apiClient.get("/owners/me/status");
  const status = response?.data?.data;

  if (typeof status !== "string") {
    return "";
  }

  return status.trim().toUpperCase();
};

export const getMyCars = async () => {
  const response = await apiClient.get("/cars/me");
  const cars = response?.data?.data;
  return Array.isArray(cars) ? cars : [];
};

export const getBookingRequests = async () => {
  const response = await apiClient.get("/bookings");
  const bookings = response?.data?.data;
  return Array.isArray(bookings) ? bookings : [];
};

export const getOwnerTime = async () => {
  const response = await apiClient.get("/owners/me/time");
  return response?.data?.data || null;
};

export const updateCarStatus = async (id, status) => {
  if (!id || !status) {
    throw new Error("Thiếu thông tin để cập nhật trạng thái xe.");
  }

  const response = await apiClient.patch(`/cars/${id}`, null, {
    params: { status },
  });

  return response?.data;
};

export const updateOwnerTime = async ({ open, close }) => {
  if (!open || !close) {
    throw new Error("Thiếu thời gian mở cửa hoặc đóng cửa.");
  }

  const response = await apiClient.put(
    "/owners/me/time",
    {
      open,
      close,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response?.data;
};

export const updateOwnerTimeWithParams = async ({ open, close }) => {
  const response = await apiClient.put("/owners/me/time", null, {
    params: { open, close },
  });

  return response?.data;
};

const ownerService = {
  registerOwner,
  getOwnerStatus,
  getMyCars,
  getBookingRequests,
  getOwnerTime,
  updateCarStatus,
  updateOwnerTime,
  updateOwnerTimeWithParams,
};

export default ownerService;
