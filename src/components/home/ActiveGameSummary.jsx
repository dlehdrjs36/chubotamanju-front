const ActiveGameSummary = ({
  activeGuild,
  requestCount,
  isLoggedIn,
  onRequestCreate,
}) => {
  // 로그인하지 않았거나 길드를 선택하지 않았으면 의뢰 등록으로 진입할 수 없습니다.
  const isRequestCreateDisabled = !activeGuild || !isLoggedIn;

  // guild 표시 로직은 이 요약 카드에서 쓰는 문구에 맞춰 컴포넌트 내부에서만 처리합니다.
  // 사용자에게 보이는 텍스트는 guildId가 아니라 guildName을 우선 사용합니다.
  const getGuildDisplayName = (guild) => {
    const displayName =
      guild?.guildName ??
      guild?.guild_name ??
      guild?.name ??
      guild?.displayName ??
      guild?.display_name ??
      guild?.serverName ??
      guild?.server_name;

    if (displayName) {
      return displayName;
    }

    if (!guild?.guildId) {
      return "길드 미선택";
    }

    return "이름 없는 길드";
  };

  const activeGuildDisplayName = getGuildDisplayName(activeGuild);

  return (
    <div className="flex justify-between gap-[18px] rounded-[22px] bg-gradient-to-br from-[#5865f2] to-violet-600 p-[22px] text-white shadow-[0_18px_32px_rgba(88,101,242,0.18)] max-[560px]:flex-col max-[560px]:items-stretch">
      <div>
        <p className="mt-0 mb-1 text-xs font-extrabold tracking-[0.12em] uppercase opacity-70">
          현재 선택 길드
        </p>
        <h1
          className="m-0 text-2xl leading-tight font-bold sm:text-[34px]"
          id="active-guild-title"
        >
          {activeGuildDisplayName}
        </h1>
        <p className="mt-2 mb-0 max-w-[680px] text-white/80">
          {activeGuild
            ? `${activeGuildDisplayName}에 등록된 의뢰를 표시합니다.`
            : "왼쪽에서 길드를 선택하면 의뢰 목록이 표시됩니다."}
        </p>
      </div>

      {/* 우측에는 현재 표시 중인 미션 수와 등록 버튼을 배치합니다. */}
      <div className="flex shrink-0 flex-col items-end justify-between gap-4 max-[560px]:items-start">
        <span className="rounded-full bg-white px-3 py-2 text-sm font-black text-indigo-950">
          {requestCount}건
        </span>
        <button
          className="min-h-12 cursor-pointer rounded-2xl bg-green-500 px-6 text-base font-black text-white shadow-[0_14px_28px_rgba(34,197,94,0.24)] transition hover:-translate-y-px hover:shadow-[0_18px_32px_rgba(34,197,94,0.28)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 max-[560px]:w-full"
          type="button"
          disabled={isRequestCreateDisabled}
          title={isLoggedIn ? "의뢰 등록" : "로그인 후 의뢰 등록이 가능합니다."}
          onClick={onRequestCreate}
        >
          의뢰 등록
        </button>
      </div>
    </div>
  );
};

export default ActiveGameSummary;
