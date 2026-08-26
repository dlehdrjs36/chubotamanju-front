import { useMemo } from "react";
import { useUserGuildsData } from "./queries/use-user-guilds-data";
import { useUserProfileData } from "./queries/use-user-profile-data";
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

const normalizeGuilds = (guildsResponse) => {
  return getGuildList(guildsResponse)
    .map((guild) => ({
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
    }))
    .filter((guild) => Boolean(guild.guildId));
};

// Home 화면에서 필요한 로그인/길드 서버 상태와 선택 길드 세션 상태를 한 곳에서 정규화합니다.
export function useHomeGuilds() {
  const selectedGuildId = useSessionStore((state) => state.selectedGuildId);
  const { data: userProfile, isLoading: isUserProfileLoading } = useUserProfileData(); //로그인 사용자 정보 조회
  const isLoggedIn = Boolean(userProfile?.data); //로그인 데이터가 있으면 로그인 상태

  const {
    data: fetchedUserGuildsData,
    isLoading: isUserGuildsLoading,
    error: userGuildsError,
  } = useUserGuildsData({ enabled: isLoggedIn }); //사용자가 로그인 상태면 길드 정보 조회

  const userGuildsData = isLoggedIn ? fetchedUserGuildsData : null;
  const guilds = useMemo(
    () => normalizeGuilds(userGuildsData),
    [userGuildsData],
  );
  const activeGuild = useMemo(() => {
    return guilds.find((guild) => guild.guildId === selectedGuildId);
  }, [guilds, selectedGuildId]);

  return {
    userProfile,
    isLoggedIn,
    isUserProfileLoading,
    guilds,
    activeGuild,
    selectedGuildId,
    isUserGuildsLoading: isLoggedIn && isUserGuildsLoading,
    userGuildsError: isLoggedIn ? userGuildsError : null,
    hasGuilds: isLoggedIn && guilds.length > 0,
  };
}
