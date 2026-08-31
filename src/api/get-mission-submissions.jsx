import { apiClient } from "../api";

// 선택한 미션에 제출된 헌터 보고 목록을 가져옵니다.
export const getMissionSubmissions = async ({ missionId, signal }) => {
  const response = await apiClient.get(
    `/missions/${encodeURIComponent(missionId)}/submissions`,
    { signal },
  );

  return response.data;
};
