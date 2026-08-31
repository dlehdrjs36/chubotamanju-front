import { useMemo } from "react";
import { useMyGuildMissionsData } from "./queries/use-my-guild-missions-data";
import { useHomeUiStore } from "../store/page/useHomeUiStore";
import { useHomeGuilds } from "./use-home-guilds";

const EMPTY_MISSIONS = [];

const toText = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
};

const firstPresentValue = (...values) => {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
};

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

const getMissionRewardCount = (mission) => {
  if (mission.rewardCount) {
    return mission.rewardCount;
  }

  const rewardLimit = mission.rewardLimit ?? mission.reward_limit;
  const rewardRemaining = mission.rewardRemaining ?? mission.reward_remaining;

  if (rewardLimit != null && rewardRemaining != null) {
    return `${rewardRemaining}/${rewardLimit}`;
  }

  if (rewardLimit != null) {
    return `${rewardLimit}회`;
  }

  return "-";
};

const normalizeMissions = (guildMissionsData) => {
  const missionPages = Array.isArray(guildMissionsData?.pages)
    ? guildMissionsData.pages
    : [guildMissionsData];

  return missionPages.flatMap(getMissionList).map((mission, index) => {
    const missionId = toText(
      firstPresentValue(mission.id, mission.missionId, mission.mission_id),
    );
    const requesterId = toText(
      firstPresentValue(
        mission.requesterId,
        mission.requesterDiscordUserId,
        mission.requester_discord_user_id,
      ),
    );

    return {
      ...mission,
      requestNumber: firstPresentValue(
        mission.requestNumber,
        mission.missionNumber,
        mission.mission_number,
        missionId ? `MISSION-${missionId}` : `MISSION-${index + 1}`,
      ),
      requestName: firstPresentValue(
        mission.requestName,
        mission.title,
        mission.name,
        "제목 없음",
      ),
      requester: firstPresentValue(
        mission.requester,
        mission.requesterName,
        mission.requester_name,
        requesterId,
        "알 수 없음",
      ),
      requesterId,
      reward: firstPresentValue(
        mission.reward,
        mission.rewardText,
        mission.reward_text,
        "보상 정보 없음",
      ),
      rewardCount: getMissionRewardCount(mission),
      description: mission.description ?? "",
    };
  });
};

const getMissionSearchText = (mission) => {
  return [
    mission.requestNumber,
    mission.requestName,
    mission.requester,
    mission.requesterId,
    mission.reward,
    mission.rewardCount,
    mission.description,
    mission.title,
    mission.rewardText,
    mission.status,
  ]
    .join(" ")
    .toLowerCase();
};

// Home 미션 목록과 동일한 화면 상태를 유지하되, 본인이 등록한 미션 API만 사용합니다.
export function useMyRegisteredMissions() {
  const homeGuilds = useHomeGuilds();
  const keyword = useHomeUiStore((state) => state.keyword);
  const selectedGuildId = homeGuilds.activeGuild?.guildId ?? "";
  const guildMissionsQuery = useMyGuildMissionsData(selectedGuildId, {
    enabled: homeGuilds.isLoggedIn,
  });

  const missions = useMemo(
    () => normalizeMissions(guildMissionsQuery.data),
    [guildMissionsQuery.data],
  );
  const visibleMissions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return missions ?? EMPTY_MISSIONS;
    }

    return (missions ?? EMPTY_MISSIONS).filter((mission) =>
      getMissionSearchText(mission).includes(normalizedKeyword),
    );
  }, [missions, keyword]);

  return {
    ...homeGuilds,
    ...guildMissionsQuery,
    keyword,
    missions,
    visibleMissions,
    hasKeyword: keyword.trim().length > 0,
    activeGuildDisplayName: homeGuilds.activeGuild?.guildName ?? "길드",
  };
}
