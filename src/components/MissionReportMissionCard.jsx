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

const MissionReportMissionCard = ({ mission, guild, onBack }) => {
  return (
    <article className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-[18px] text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-2.5 max-[560px]:flex-col max-[560px]:items-stretch">
        <span className="inline-flex min-h-7 items-center rounded-full bg-indigo-50 px-2.5 text-xs font-black whitespace-nowrap text-indigo-700">
          {mission.requestNumber}
        </span>
        <span className="inline-flex min-h-7 items-center rounded-full bg-emerald-50 px-2.5 text-xs font-black whitespace-nowrap text-emerald-700">
          {getGuildDisplayName(guild)}
        </span>
      </div>

      <h1 className="mb-4 text-[19px] leading-snug font-bold text-slate-900">
        {mission.requestName}
      </h1>

      <dl className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div className="min-w-0 rounded-[14px] bg-slate-50 p-3">
          <dt className="mb-1 text-xs font-black text-slate-400">의뢰자</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-slate-700">
            {mission.requester ?? "나"}
          </dd>
        </div>
        <div className="min-w-0 rounded-[14px] bg-slate-50 p-3">
          <dt className="mb-1 text-xs font-black text-slate-400">보상</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-slate-700">
            {mission.reward}
          </dd>
        </div>
        <div className="min-w-0 rounded-[14px] bg-slate-50 p-3">
          <dt className="mb-1 text-xs font-black text-slate-400">보수횟수</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-slate-700">
            {mission.rewardCount}
          </dd>
        </div>
        <div className="col-span-full min-w-0 rounded-[14px] bg-slate-50 p-3">
          <dt className="mb-1 text-xs font-black text-slate-400">의뢰설명</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-slate-700">
            {mission.description || "등록된 의뢰 설명이 없습니다."}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-end">
        <button
          className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50"
          type="button"
          onClick={onBack}
        >
          목록으로
        </button>
      </div>
    </article>
  );
};

export default MissionReportMissionCard;
