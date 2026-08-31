import { useEffect, useRef } from "react";
import { useHomeMissions } from "../../hooks/use-home-missions";
import HomeEmptyState from "./HomeEmptyState";
import MissionCard from "./MissionCard";

const MissionList = ({
  useMissions = useHomeMissions,
  missionCardActionVariant = "proof",
  emptyTitle = "등록된 미션이 없습니다.",
  emptyDescription = "이 길드에 새 미션이 등록되면 이곳에 표시됩니다.",
}) => {
  const loadMoreRef = useRef(null);
  const {
    isLoggedIn,
    isUserProfileLoading,
    isUserGuildsLoading,
    userGuildsError,
    hasGuilds,
    activeGuild,
    visibleMissions,
    hasKeyword,
    isLoading: isMissionsLoading,
    error: missionsError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMissions();

  const canLoadMoreMissions = Boolean(
    isLoggedIn &&
    activeGuild &&
    hasNextPage &&
    !isFetchingNextPage &&
    !userGuildsError &&
    !missionsError,
  );
  const shouldShowLoadMoreIndicator = Boolean(
    isLoggedIn &&
    activeGuild &&
    !userGuildsError &&
    !missionsError &&
    (hasNextPage || isFetchingNextPage),
  );

  // 무한 스크롤: 하단 감지 영역이 보이면 마지막 미션의 id/createdAt 기준으로 다음 페이지를 조회합니다.
  // 인증이 만료되어 요청이 실패하면 hasNextPage가 이전 성공 페이지 기준으로 남아있을 수 있으므로,
  // 에러 상태에서는 감지 영역을 제거하고 추가 호출을 막습니다.
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !canLoadMoreMissions) {
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
  }, [canLoadMoreMissions, fetchNextPage]);

  const renderContent = () => {
    // 1. 로그인 상태 확인 또는 길드 목록 자체가 아직 없으면 사이드바/목록 모두 대기 상태입니다.
    if (isUserProfileLoading || (isLoggedIn && isUserGuildsLoading)) {
      return (
        <HomeEmptyState
          title="길드 목록을 불러오는 중입니다."
          description="잠시만 기다려 주세요."
        />
      );
    }

    // 2. 로그아웃 상태에서는 이전 사용자 캐시 대신 로그인 안내를 표시합니다.
    if (!isLoggedIn) {
      return (
        <HomeEmptyState
          title="로그인이 필요합니다."
          description="Discord 로그인 후 길드 목록과 미션을 확인할 수 있습니다."
        />
      );
    }

    // 3. 길드 목록 조회 실패는 미션 조회 이전 단계의 에러입니다.
    if (userGuildsError) {
      return (
        <HomeEmptyState
          title="길드 목록을 불러오지 못했습니다."
          description="로그인 상태를 확인한 뒤 다시 시도해 주세요."
          isError
        />
      );
    }

    // 4. 사용자가 접근 가능한 길드가 없으면 미션 조회 버튼도 의미가 없습니다.
    if (!hasGuilds) {
      return (
        <HomeEmptyState
          title="선택 가능한 길드가 없습니다."
          description="Discord 봇이 동작 중인 길드가 등록되면 이곳에 표시됩니다."
        />
      );
    }

    // 5. 요구사항상 길드를 클릭하기 전에는 미션 API를 호출하지 않습니다.
    if (!activeGuild) {
      return (
        <HomeEmptyState
          title="길드를 선택해 주세요."
          description="왼쪽 길드 목록을 클릭하면 해당 길드의 미션을 불러옵니다."
        />
      );
    }

    // 6. 길드가 선택된 뒤에는 해당 길드 미션 목록만 로딩합니다.
    if (isMissionsLoading) {
      return (
        <HomeEmptyState
          title="미션을 불러오는 중입니다."
          description="선택한 길드의 미션 목록을 조회하고 있습니다."
        />
      );
    }

    // 7. 미션 조회 실패는 선택된 길드에 한정된 에러로 보여줍니다.
    if (missionsError) {
      return (
        <HomeEmptyState
          title="미션을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          isError
        />
      );
    }

    // 8. 빈 목록은 검색 결과 없음과 실제 미션 없음 메시지를 구분합니다.
    if (visibleMissions.length === 0) {
      return (
        <HomeEmptyState
          title={hasKeyword ? "검색 결과가 없습니다." : emptyTitle}
          description={
            hasKeyword ? "다른 키워드로 다시 검색해 주세요." : emptyDescription
          }
        />
      );
    }

    // 9. 모든 조건을 통과하면 정규화된 미션을 카드 목록으로 표시합니다.
    return visibleMissions.map((request) => (
      <MissionCard
        key={request.requestNumber}
        request={request}
        guild={activeGuild}
        actionVariant={missionCardActionVariant}
      />
    ));
  };

  return (
    <div
      className="grid grid-cols-2 gap-4 max-[920px]:grid-cols-1"
      aria-live="polite"
    >
      {renderContent()}

      {shouldShowLoadMoreIndicator ? (
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
  );
};

export default MissionList;
