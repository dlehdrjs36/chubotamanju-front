import { apiClient } from "../api";

// 사용자가 사이드바에서 선택한 길드의 미션 목록을 가져옵니다.
export const getGuildMissions = async ({
  guildId,
  lastBountyMissionId,
  lastCreatedAt,
  size,
  signal,
}) => {
  const response = await apiClient.get(
    `guilds/${encodeURIComponent(guildId)}/missions`,
    {
      signal,
      params: {
        lastBountyMissionId,
        lastCreatedAt,
        size,
      },
    },
  );

  return response.data;
};
