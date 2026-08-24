import HomeEmptyState from "./HomeEmptyState";
import RequestCard from "./RequestCard";

const RequestList = ({
  isLoggedIn,
  isGuildsLoading,
  isMissionsLoading,
  guildsError,
  missionsError,
  hasGuilds,
  activeGuild,
  requests,
  hasKeyword,
}) => {
  // 1. 길드 목록 자체가 아직 없으면 사이드바/목록 모두 대기 상태입니다.
  if (isGuildsLoading) {
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
  if (guildsError) {
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
  if (requests.length === 0) {
    return (
      <HomeEmptyState
        title={hasKeyword ? "검색 결과가 없습니다." : "등록된 미션이 없습니다."}
        description={
          hasKeyword
            ? "다른 키워드로 다시 검색해 주세요."
            : "이 길드에 새 미션이 등록되면 이곳에 표시됩니다."
        }
      />
    );
  }

  // 9. 모든 조건을 통과하면 정규화된 미션을 카드 목록으로 표시합니다.
  return requests.map((request) => (
    <RequestCard
      key={request.requestNumber}
      request={request}
      guild={activeGuild}
    />
  ));
};

export default RequestList;
