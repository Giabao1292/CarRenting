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

const pickFirstText = (...values) => {
  const matchedValue = values.find(
    (value) => typeof value === "string" && value.trim(),
  );

  return matchedValue ? matchedValue.trim() : "";
};

const normalizeOwner = (owner = {}) => ({
  ...owner,
  id: owner.id ?? owner.ownerProfileId ?? owner.owner_id ?? null,
  userId: owner.userId ?? owner.user_id ?? null,
  fullName: pickFirstText(
    owner.fullName,
    owner.full_name,
    owner.fullname,
    owner.name,
  ),
  email: pickFirstText(owner.email, owner.userEmail, owner.user_email),
  phone: pickFirstText(owner.phone, owner.userPhone, owner.user_phone),
  city: pickFirstText(owner.city),
  ownerType: pickFirstText(owner.ownerType, owner.owner_type),
  residencyType: pickFirstText(owner.residencyType, owner.residency_type),
  verificationStatus: pickFirstText(
    owner.verificationStatus,
    owner.verification_status,
    owner.status,
  ),
  reviewNote: pickFirstText(owner.reviewNote, owner.review_note, owner.reason),
  address: pickFirstText(owner.address),
  idNumber: pickFirstText(owner.idNumber, owner.id_number),
  idCardFrontUrl: pickFirstText(owner.idCardFrontUrl, owner.id_card_front_url),
  idCardBackUrl: pickFirstText(owner.idCardBackUrl, owner.id_card_back_url),
  userRole: pickFirstText(owner.userRole, owner.user_role),
});

const normalizeOwnerPage = (page = {}) => ({
  ...page,
  content: Array.isArray(page.content)
    ? page.content.map((owner) => normalizeOwner(owner))
    : [],
});

const getOwnersByStatus = async (endpoint, { keyword = "", page = 0, size = 10 } = {}) => {
  try {
    const response = await apiClient.get(endpoint, {
      params: buildParams({
        keyword,
        page,
        size,
      }),
    });

    return normalizeOwnerPage(unwrapResponse(response));
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load owners"));
  }
};

export const getAdminOwnerSummary = async () => {
  try {
    const response = await apiClient.get("/owners/admin/summary");
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load owner summary"));
  }
};

export const getPendingOwners = async (params = {}) =>
  getOwnersByStatus("/owners/admin/pending", params);

export const getApprovedOwners = async (params = {}) =>
  getOwnersByStatus("/owners/admin/approved", params);

export const getRejectedOwners = async (params = {}) =>
  getOwnersByStatus("/owners/admin/rejected", params);

export const getAdminOwnerDetail = async (id) => {
  try {
    const response = await apiClient.get(`/owners/admin/${id}`);
    return normalizeOwner(unwrapResponse(response));
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load owner detail"));
  }
};

export const approveOwner = async (id) => {
  try {
    const response = await apiClient.put(`/owners/admin/${id}/approve`);
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to approve owner"));
  }
};

export const rejectOwner = async (id, reason) => {
  try {
    const response = await apiClient.put(`/owners/admin/${id}/reject`, {
      reason,
    });
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to reject owner"));
  }
};
