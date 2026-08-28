import { apiClient } from "../api";

// 선택한 미션에 의뢰보고를 제출합니다.
export const createMissionProof = async (payload) => {
  const response = await apiClient.post("/missions/proof", payload);

  return response.data;
};
