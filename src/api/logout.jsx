import { apiClient } from "../api";

export const logout = async () => {
  const response = await apiClient.post("logout");

  return response.data;
};
