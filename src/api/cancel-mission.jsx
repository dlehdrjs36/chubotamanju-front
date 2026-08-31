import { apiClient } from "../api";

// 유저 본인이 등록한 미션을 취소합니다.
export const cancelMission = async ({ missionId }) => {
  const response = await apiClient.post(
    `/missions/${encodeURIComponent(missionId)}/cancle`,
  );

  return response.data;
};
