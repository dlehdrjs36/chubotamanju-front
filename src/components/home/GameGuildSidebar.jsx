const GameGuildSidebar = ({
  guilds,
  activeGuild,
  isActiveGuildMissionsLoading,
  activeGuildMissionCount,
  onSelectGuild,
}) => {
  // 사이드바에서 쓰는 길드 이름 fallback은 별도 guild 유틸 없이 이 컴포넌트 안에서 결정합니다.
  // 사용자에게 보이는 버튼 텍스트는 guildId가 아니라 guildName을 우선 사용합니다.
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

    return "이름 없는 길드";
  };

  // 길드 이름이 있으면 이름 앞 2글자를 아바타에 사용하고, ID는 표시용 fallback으로 쓰지 않습니다.
  const getGuildInitials = (guild) => {
    const displayName =
      guild?.guildName ??
      guild?.guild_name ??
      guild?.name ??
      guild?.displayName ??
      guild?.display_name ??
      guild?.serverName ??
      guild?.server_name;

    if (displayName) {
      return displayName.replace(/\s/g, "").slice(0, 2).toUpperCase();
    }

    if (!guild?.guildId) {
      return "G";
    }

    return "G";
  };

  // 선택된 길드만 미션 수 또는 로딩 상태를 보여주고, 나머지는 클릭 안내만 표시합니다.
  const getGuildSubtitle = (guild) => {
    if (guild.guildId !== activeGuild?.guildId) {
      return "클릭해서 미션 조회";
    }

    if (isActiveGuildMissionsLoading) {
      return "미션 불러오는 중";
    }

    return `미션 ${activeGuildMissionCount}건`;
  };

  return (
    <aside
      className="min-w-0 overflow-y-auto border-r border-slate-200 bg-slate-100 px-4 py-[22px] max-[920px]:overflow-visible max-[920px]:border-r-0 max-[920px]:border-b"
      aria-label="길드 목록"
    >
      <p className="mt-0 mb-4 text-[13px] font-black tracking-[0.12em] text-slate-600 uppercase max-[920px]:mb-3">
        길드
      </p>

      <div className="flex flex-col gap-3">
        {/* 길드 목록 API가 빈 배열을 반환한 경우의 사이드바 빈 상태입니다. */}
        {guilds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-5 text-center text-sm font-bold text-slate-400">
            표시할 길드가 없습니다.
          </div>
        ) : null}

        {/* 길드 버튼을 누르면 Home에서 activeGuildId를 바꾸고 미션 조회를 시작합니다. */}
        {guilds.map((guild) => {
          const isActiveGuild = guild.guildId === activeGuild?.guildId;
          const guildDisplayName = getGuildDisplayName(guild);

          return (
            <button
              className={`flex min-h-[72px] w-full cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 text-left transition hover:-translate-y-px hover:border-indigo-200 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] ${
                isActiveGuild
                  ? "border-indigo-200 bg-white text-indigo-950 shadow-[inset_0_0_0_1px_rgba(88,101,242,0.16)]"
                  : "border-transparent bg-transparent text-slate-600"
              }`}
              key={guild.guildId}
              type="button"
              aria-pressed={isActiveGuild}
              title={guildDisplayName}
              onClick={() => onSelectGuild(guild.guildId)}
            >
              <span
                className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-[#5865f2] to-violet-600 text-sm font-black tracking-[-0.02em] text-white"
                aria-hidden="true"
              >
                {getGuildInitials(guild)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-black">
                  {guildDisplayName}
                </span>
                <span className="mt-0.5 block truncate text-xs font-bold text-slate-400">
                  {getGuildSubtitle(guild)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default GameGuildSidebar;
