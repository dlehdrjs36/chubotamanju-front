import { apiClient } from "../api";

// 사용자가 사이드바에서 선택한 길드에서 본인이 등록한 미션 목록을 가져옵니다.
export const getMyGuildMissions = async ({
  guildId,
  lastBountyMissionId,
  lastCreatedAt,
  size,
  signal,
}) => {
  const response = await apiClient.get(
    `guilds/${encodeURIComponent(guildId)}/missions/me`,
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
