import { apiClient } from "../api";

// 선택한 길드에 새 미션을 생성합니다.
export const createGuildMission = async (payload) => {
  const response = await apiClient.post("/missions", payload);

  return response.data;
};
