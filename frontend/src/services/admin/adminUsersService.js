import apiClient from "../../api/axios";

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data ||
  error?.message ||
  fallbackMessage;

export const getUserDashboard = async () => {
  try {
    const response = await apiClient.get("/users/admin/dashboardUser");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load dashboard"));
  }
};

export const getCustomers = async ({ keyword = "", page = 0, size = 10 } = {}) => {
  try {
    const response = await apiClient.get("/users/admin/customers", {
      params: {
        keyword,
        page,
        size,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load customers"));
  }
};

export const toggleCustomerBlockStatus = async ({ id, isDeleted }) => {
  const action = isDeleted ? "unlock" : "block";

  try {
    const response = await apiClient.put(`/users/admin/customers/${id}/${action}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, `Unable to ${action} customer`));
  }
};
