import { useInfiniteQuery } from "@tanstack/react-query";
import { getMyGuildMissions } from "../../api/get-my-guild-missions";

const MISSION_PAGE_SIZE = 20;

const getMissionList = (missionsResponse) => {
  if (Array.isArray(missionsResponse?.data)) {
    return missionsResponse.data;
  }

  if (Array.isArray(missionsResponse?.data?.missions)) {
    return missionsResponse.data.missions;
  }

  if (Array.isArray(missionsResponse?.missions)) {
    return missionsResponse.missions;
  }

  if (Array.isArray(missionsResponse)) {
    return missionsResponse;
  }

  return [];
};

const getNextMissionCursor = (mission) => {
  const lastBountyMissionId = mission?.id ?? mission?.missionId;
  const lastCreatedAt = mission?.createdAt ?? mission?.created_at;

  if (lastBountyMissionId == null || !lastCreatedAt) {
    return undefined;
  }

  return {
    lastBountyMissionId,
    lastCreatedAt,
  };
};

// guildId가 있을 때만 본인이 등록한 미션을 조회해서 불필요한 API 호출을 막습니다.
export function useMyGuildMissionsData(guildId, { enabled = true } = {}) {
  return useInfiniteQuery({
    queryFn: ({ pageParam, signal }) =>
      getMyGuildMissions({
        guildId,
        size: MISSION_PAGE_SIZE,
        signal,
        ...pageParam,
      }),
    queryKey: ["myGuildMissions", guildId],
    enabled: Boolean(guildId) && enabled,
    initialPageParam: {},
    getNextPageParam: (lastPage) => {
      const missions = getMissionList(lastPage);

      if (missions.length < MISSION_PAGE_SIZE) {
        return undefined;
      }

      return getNextMissionCursor(missions[missions.length - 1]);
    },
    retry: false,
  });
}
