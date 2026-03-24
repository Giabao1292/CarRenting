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

const ownerService = {
  registerOwner,
  getOwnerStatus,
};

export default ownerService;
