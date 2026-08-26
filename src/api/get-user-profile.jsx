import { apiClient } from "../api";

export const getUserProfile = async ({ signal } = {}) => {
  const response = await apiClient.get("me", { signal });

  return response.data;
};
