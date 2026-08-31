import { useMemo } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "../store/session/useSessionStore";

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

const getMissionId = (mission) => {
  return firstPresentValue(mission?.id, mission?.missionId, mission?.mission_id);
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

  if (Array.isArray(missionsResponse?.pages)) {
    return missionsResponse.pages.flatMap(getMissionList);
  }

  if (Array.isArray(missionsResponse)) {
    return missionsResponse;
  }

  return [];
};

const getGuildList = (guildsResponse) => {
  if (Array.isArray(guildsResponse?.data)) {
    return guildsResponse.data;
  }

  if (Array.isArray(guildsResponse?.data?.guilds)) {
    return guildsResponse.data.guilds;
  }

  if (Array.isArray(guildsResponse?.guilds)) {
    return guildsResponse.guilds;
  }

  if (Array.isArray(guildsResponse)) {
    return guildsResponse;
  }

  return [];
};

const normalizeGuild = (guild) => {
  if (!guild) {
    return undefined;
  }

  return {
    ...guild,
    guildId: toText(guild?.guildId ?? guild?.guild_id ?? guild?.id),
    guildName:
      toText(
        firstPresentValue(
          guild?.guildName,
          guild?.guild_name,
          guild?.name,
          guild?.displayName,
          guild?.display_name,
          guild?.serverName,
          guild?.server_name,
        ),
      ) || "이름 없는 길드",
  };
};

const normalizeMission = (mission, fallbackMissionId) => {
  if (!mission) {
    return undefined;
  }

  const missionId = toText(getMissionId(mission) ?? fallbackMissionId);
  const rewardLimit = mission.rewardLimit ?? mission.reward_limit;
  const rewardRemaining = mission.rewardRemaining ?? mission.reward_remaining;

  return {
    ...mission,
    id: missionId,
    missionId,
    requestNumber: firstPresentValue(
      mission.requestNumber,
      mission.missionNumber,
      mission.mission_number,
      missionId ? `MISSION-${missionId}` : "MISSION",
    ),
    requestName: firstPresentValue(
      mission.requestName,
      mission.title,
      mission.name,
      "제목 없음",
    ),
    reward: firstPresentValue(
      mission.reward,
      mission.rewardText,
      mission.reward_text,
      "보상 정보 없음",
    ),
    rewardCount: firstPresentValue(
      mission.rewardCount,
      rewardLimit != null && rewardRemaining != null
        ? `${rewardRemaining}/${rewardLimit}`
        : undefined,
      rewardLimit != null ? `${rewardLimit}회` : undefined,
      "-",
    ),
    description: mission.description ?? "",
  };
};

// 보고확인 페이지에서 필요한 대상 미션/길드 정보를 라우트 state와 쿼리 캐시에서 찾습니다.
export function useMissionReportReviewTarget() {
  const { missionId = "" } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const selectedGuildId = useSessionStore((state) => state.selectedGuildId);

  const target = useMemo(() => {
    const stateMission = location.state?.mission;
    const cachedMission = [
      ...queryClient.getQueriesData({ queryKey: ["myGuildMissions"] }),
      ...queryClient.getQueriesData({ queryKey: ["guildMissions"] }),
    ]
      .flatMap(([, queryData]) => getMissionList(queryData))
      .find((mission) => toText(getMissionId(mission)) === missionId);
    const mission = normalizeMission(stateMission ?? cachedMission, missionId);

    const guildId =
      location.state?.guild?.guildId ??
      location.state?.guild?.guild_id ??
      mission?.guildId ??
      mission?.guild_id ??
      searchParams.get("guildId") ??
      selectedGuildId ??
      "";

    const cachedGuild = getGuildList(queryClient.getQueryData(["userGuilds"]))
      .map(normalizeGuild)
      .find((guild) => guild?.guildId === guildId);
    const guild = normalizeGuild(location.state?.guild) ?? cachedGuild ?? {
      guildId,
      guildName: guildId ? "선택된 길드" : "길드 미선택",
    };

    return {
      mission,
      missionId,
      guild,
      guildId,
      cancelPath: guildId
        ? `/missions/me?guildId=${encodeURIComponent(guildId)}`
        : "/missions/me",
    };
  }, [location.state, missionId, queryClient, searchParams, selectedGuildId]);

  return target;
}
