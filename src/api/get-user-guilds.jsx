import { apiClient } from "../api";

// 로그인한 사용자가 접근할 수 있는 Discord 길드 목록만 가져옵니다.
export const getUserGuilds = async ({ signal } = {}) => {
  const response = await apiClient.get("guilds", { signal });

  return response.data;
};
