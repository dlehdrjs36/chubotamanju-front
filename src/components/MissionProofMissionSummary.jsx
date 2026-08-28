const MissionProofMissionSummary = ({ mission, guild }) => {
  const guildName = guild?.guildName ?? "길드 미선택";

  return (
    <section
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.07)]"
      aria-label="보고 대상 미션"
    >
      <div className="mb-6 flex items-center justify-between gap-3 max-[560px]:flex-col max-[560px]:items-stretch">
        <span className="inline-flex min-h-9 items-center rounded-full bg-indigo-50 px-5 text-base font-black whitespace-nowrap text-indigo-700">
          {mission.requestNumber}
        </span>
        <span className="inline-flex min-h-9 items-center rounded-full bg-emerald-50 px-5 text-base font-black whitespace-nowrap text-emerald-700">
          {guildName}
        </span>
      </div>

      <p className="mb-2 text-sm font-black tracking-[0.08em] text-slate-500 uppercase">
        미션 제목
      </p>
      <h1 className="mb-8 text-[34px] leading-tight font-black text-slate-950 max-[640px]:text-[28px]">
        {mission.requestName}
      </h1>

      <div className="rounded-[22px] bg-slate-50 p-6">
        <p className="mb-2 text-sm font-black text-slate-400">미션 내용</p>
        <p className="m-0 text-lg leading-8 font-bold [overflow-wrap:anywhere] text-slate-700">
          {mission.description || "등록된 미션 설명이 없습니다."}
        </p>
      </div>
    </section>
  );
};

export default MissionProofMissionSummary;
