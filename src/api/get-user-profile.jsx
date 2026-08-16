import { apiClient } from "../api";

export const getUserProfile = async () => {
    const response = await apiClient.get("me");
    console.log(response);
    return await response.data;
} 
