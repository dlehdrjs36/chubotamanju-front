import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import guildHallImage from "../assets/guild/guild-hall.png";
import ActiveGameSummary from "../components/home/ActiveGameSummary";
import GameGuildSidebar from "../components/home/GameGuildSidebar";
import HomeHeroBanner from "../components/home/HomeHeroBanner";
import RequestList from "../components/home/RequestList";
import RequestSearchInput from "../components/home/RequestSearchInput";

import { useGuildMissionsData } from "../hooks/queries/use-guild-missions-data";
import { useUserGuildsData } from "../hooks/queries/use-user-guilds-data";
import { useUserProfileData } from "../hooks/queries/use-user-profile-data";

// 검색 결과가 없을 때 매 렌더마다 새 배열을 만들지 않기 위한 고정 빈 배열입니다.
const EMPTY_MISSIONS = [];

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 등록/취소 후 돌아온 경우 기존 선택 길드를 다시 선택하기 위해 URL의 guildId를 초기값으로 사용합니다.
  const initialGuildId =
    searchParams.get("guildId") ?? searchParams.get("gameId") ?? "";

  // 사용자가 선택한 길드 id입니다. 빈 값이면 아직 어떤 길드도 선택하지 않은 상태입니다.
  const [activeGuildId, setActiveGuildId] = useState(initialGuildId);

  // 현재 선택된 길드의 미션 목록에서만 사용하는 클라이언트 검색어입니다.
  const [keyword, setKeyword] = useState("");

  // 로그인 여부는 의뢰 등록 버튼 활성화에만 사용합니다.
  const { data: userProfile, isLoading: isUserProfileLoading } =
    useUserProfileData();
  const isLoggedIn = Boolean(userProfile?.data);

  // 홈 진입 시에는 로그인 사용자 길드 목록만 가져옵니다. 로그아웃 상태에서는 이전 캐시가 보여지지 않도록 비활성화합니다.
  const {
    data: fetchedUserGuildsData,
    isLoading: isUserGuildsLoading,
    error: userGuildsError,
  } = useUserGuildsData({ enabled: isLoggedIn });
  const userGuildsData = isLoggedIn ? fetchedUserGuildsData : null;

  const guilds = useMemo(() => {
    // 기존 guild.js 같은 공용 유틸에 의존하지 않고, Home 화면에서 필요한 응답 형태만 여기서 처리합니다.
    const toText = (value) => {
      if (typeof value === "string" || typeof value === "number") {
        return String(value);
      }

      return "";
    };

    // null, undefined, 빈 문자열을 건너뛰고 화면에 표시할 첫 번째 값을 고릅니다.
    const firstPresentValue = (...values) => {
      return values.find(
        (value) => value !== undefined && value !== null && value !== "",
      );
    };

    // get-user-guilds 응답이 ApiResult 또는 배열로 와도 Home에서 쓸 길드 배열로 꺼냅니다.
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

    // 길드 객체마다 guildId 필드를 보장해서 선택 상태 비교를 단순하게 만듭니다.
    // 화면에 보여줄 이름은 guildName으로 통일해서 guildId가 노출되지 않게 합니다.
    return getGuildList(userGuildsData)
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
  }, [userGuildsData]);

  // 현재 선택된 길드 객체입니다. 선택 전이거나 권한 없는 guildId면 undefined가 됩니다.
  const activeGuild = useMemo(() => {
    return guilds.find((guild) => guild.guildId === activeGuildId);
  }, [activeGuildId, guilds]);

  // activeGuild가 존재할 때만 미션 API가 활성화됩니다. 즉, 초기 화면에서는 호출되지 않습니다.
  const selectedGuildId = activeGuild?.guildId ?? "";
  const {
    data: guildMissionsData,
    isLoading: isGuildMissionsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: guildMissionsError,
  } = useGuildMissionsData(selectedGuildId);

  const loadMoreRef = useRef(null);

  const missions = useMemo(() => {
    // 기존 mission.js 같은 공용 유틸에 몰아두지 않고, 카드 표시용 변환을 Home 안에서 끝냅니다.
    const toText = (value) => {
      if (typeof value === "string" || typeof value === "number") {
        return String(value);
      }

      return "";
    };

    // null, undefined, 빈 문자열을 건너뛰고 화면에 표시할 첫 번째 값을 고릅니다.
    const firstPresentValue = (...values) => {
      return values.find(
        (value) => value !== undefined && value !== null && value !== "",
      );
    };

    // get-guild-missions 응답이 ApiResult 또는 배열로 와도 Home에서 쓸 미션 배열로 꺼냅니다.
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

    // 보상 횟수 필드가 없으면 rewardLimit/rewardRemaining 값으로 표시 문자열을 만듭니다.
    const getMissionRewardCount = (mission) => {
      if (mission.rewardCount) {
        return mission.rewardCount;
      }

      const rewardLimit = mission.rewardLimit ?? mission.reward_limit;
      const rewardRemaining =
        mission.rewardRemaining ?? mission.reward_remaining;

      if (rewardLimit != null && rewardRemaining != null) {
        return `${rewardRemaining}/${rewardLimit}`;
      }

      if (rewardLimit != null) {
        return `${rewardLimit}회`;
      }

      return "-";
    };

    const missionPages = Array.isArray(guildMissionsData?.pages)
      ? guildMissionsData.pages
      : [guildMissionsData];

    // 백엔드 미션 필드를 기존 카드 컴포넌트가 기대하는 request* 필드로 맞춥니다.
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
  }, [guildMissionsData]);

  // 무한 스크롤: 하단 감지 영역이 보이면 마지막 미션의 id/createdAt 기준으로 다음 페이지를 조회합니다.
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (
      !loadMoreElement ||
      !activeGuild ||
      !hasNextPage ||
      isFetchingNextPage
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [activeGuild, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 검색창 placeholder에는 guildId 대신 정규화된 guildName만 보여줍니다.
  const activeGuildDisplayName = useMemo(() => {
    return activeGuild?.guildName ?? "길드";
  }, [activeGuild]);

  // 선택된 길드의 미션 목록을 검색어로 필터링합니다.
  const visibleMissions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return missions ?? EMPTY_MISSIONS;
    }

    // 카드에 표시되는 필드와 백엔드 원본 필드를 모두 검색 대상으로 합칩니다.
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

    return (missions ?? EMPTY_MISSIONS).filter((mission) =>
      getMissionSearchText(mission).includes(normalizedKeyword),
    );
  }, [missions, keyword]);

  // 길드 변경 시 이전 길드에서 입력한 검색어는 초기화합니다.
  const handleSelectGuild = (guildId) => {
    setActiveGuildId(guildId);
    setKeyword("");
  };

  // 의뢰 등록 페이지에서도 같은 길드가 선택되도록 guildId를 URL에 싣습니다.
  const handleRequestCreate = () => {
    if (!isLoggedIn || !activeGuild) {
      return;
    }

    navigate(
      `/requests/new?guildId=${encodeURIComponent(activeGuild.guildId)}`,
    );
  };

  return (
    <section
      className="grid w-full grid-rows-[auto_auto] gap-5"
      aria-label="메인 화면"
    >
      {/* 상단 메인 비주얼 영역입니다. */}
      <HomeHeroBanner imageSrc={guildHallImage} alt="길드 홀" />

      {/* 좌측 길드 목록과 우측 미션 목록을 담는 메인 보드입니다. */}
      <div className="grid min-h-[560px] min-w-0 grid-cols-[248px_minmax(0,1fr)] overflow-hidden rounded-[28px] border border-slate-400/30 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] max-[920px]:min-h-0 max-[920px]:grid-cols-1">
        {/* 길드 클릭 시에만 해당 길드 미션 조회가 시작됩니다. */}
        <GameGuildSidebar
          guilds={guilds}
          activeGuild={activeGuild}
          isActiveGuildMissionsLoading={isGuildMissionsLoading}
          activeGuildMissionCount={missions.length}
          onSelectGuild={handleSelectGuild}
        />

        <section
          className="flex min-w-0 flex-col gap-5 p-6 max-[560px]:p-[18px]"
          aria-labelledby="active-guild-title"
        >
          {/* 선택된 길드의 미션만 검색합니다. */}
          <RequestSearchInput
            keyword={keyword}
            activeGuildName={activeGuild ? activeGuildDisplayName : undefined}
            onChange={setKeyword}
          />

          {/* 선택 길드 요약과 의뢰 등록 진입 버튼입니다. */}
          <ActiveGameSummary
            activeGuild={activeGuild}
            requestCount={visibleMissions.length}
            isLoggedIn={isLoggedIn}
            onRequestCreate={handleRequestCreate}
          />

          {/* 로딩/에러/빈 상태/미션 카드를 한 곳에서 분기합니다. */}
          <div
            className="grid grid-cols-2 gap-4 max-[920px]:grid-cols-1"
            aria-live="polite"
          >
            <RequestList
              isLoggedIn={isLoggedIn}
              isGuildsLoading={
                isUserProfileLoading || (isLoggedIn && isUserGuildsLoading)
              }
              isMissionsLoading={Boolean(activeGuild) && isGuildMissionsLoading}
              guildsError={isLoggedIn ? userGuildsError : null}
              missionsError={guildMissionsError}
              hasGuilds={isLoggedIn && guilds.length > 0}
              activeGuild={activeGuild}
              requests={visibleMissions}
              hasKeyword={keyword.trim().length > 0}
            />

            {activeGuild && (hasNextPage || isFetchingNextPage) ? (
              <div
                ref={loadMoreRef}
                className="col-span-full grid min-h-12 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white/70 text-sm font-bold text-slate-400"
              >
                {isFetchingNextPage
                  ? "미션을 더 불러오는 중입니다."
                  : "아래로 스크롤하면 다음 미션을 불러옵니다."}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Home;
