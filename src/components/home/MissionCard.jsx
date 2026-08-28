import { useNavigate } from "react-router-dom";

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
  return toText(
    firstPresentValue(
      mission?.id,
      mission?.missionId,
      mission?.mission_id,
      mission?.bountyMissionId,
      mission?.bounty_mission_id,
    ),
  );
};

const getGuildId = (guild) => {
  return toText(
    firstPresentValue(
      guild?.guildId,
      guild?.guild_id,
      guild?.id,
      guild?.serverId,
      guild?.server_id,
    ),
  );
};

// 카드 상단 배지에 표시할 길드 이름
const MissionCard = ({ request, guild }) => {
  const navigate = useNavigate();
  const missionId = getMissionId(request);
  const guildId = getGuildId(guild);

  // 사용자에게 보이는 배지에는 guildId 대신 guildName을 사용합니다.
  const getGuildDisplayName = (targetGuild) => {
    const displayName =
      targetGuild?.guildName ??
      targetGuild?.guild_name ??
      targetGuild?.name ??
      targetGuild?.displayName ??
      targetGuild?.display_name ??
      targetGuild?.serverName ??
      targetGuild?.server_name;

    if (displayName) {
      return displayName;
    }

    if (!targetGuild?.guildId) {
      return "길드 미선택";
    }

    return "이름 없는 길드";
  };

  // Discord 웹 프로필 fallback URL입니다.
  const getDiscordUserWebUrl = (discordUserId) => `https://discord.com/users/${discordUserId}`;

  // Discord 앱을 먼저 열기 위한 deep link URL입니다.
  const getDiscordUserAppUrl = (discordUserId) => `discord://-/users/${discordUserId}`;

  // Discord 앱 열기에 실패하면 짧은 시간 뒤 웹 프로필로 이동합니다.
  const openDiscordDm = (event, discordUserId) => {
    if (!discordUserId) {
      return;
    }

    event.preventDefault();

    const fallbackTimer = window.setTimeout(() => {
      window.location.href = getDiscordUserWebUrl(discordUserId);
    }, 700);

    window.addEventListener("blur", () => window.clearTimeout(fallbackTimer), {
      once: true,
    });
    window.location.href = getDiscordUserAppUrl(discordUserId);
  };

  // 의뢰보고 페이지로 이동할 때 현재 카드의 미션/길드 정보를 state로 넘겨서
  // 새 페이지에서 같은 디자인의 미션 요약을 즉시 표시할 수 있게 합니다.
  const handleMissionProofClick = () => {
    if (!missionId) {
      return;
    }

    const search = guildId ? `?guildId=${encodeURIComponent(guildId)}` : "";

    navigate(`/missions/${encodeURIComponent(missionId)}/proof${search}`, {
      state: {
        mission: request,
        guild,
      },
    });
  };

  return (
    <article
      className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-[18px] shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.10)]"
      key={request.requestNumber}
    >
      {/* 미션 번호와 선택 길드를 한눈에 볼 수 있는 상단 배지 영역입니다. */}
      <div className="mb-3 flex items-center justify-between gap-2.5 max-[560px]:flex-col max-[560px]:items-stretch">
        <span className="inline-flex min-h-7 items-center rounded-full bg-indigo-50 px-2.5 text-xs font-black whitespace-nowrap text-indigo-700">
          {request.requestNumber}
        </span>
        <span className="inline-flex min-h-7 items-center rounded-full bg-emerald-50 px-2.5 text-xs font-black whitespace-nowrap text-emerald-700">
          {getGuildDisplayName(guild)}
        </span>
      </div>

      {/* 미션 제목입니다. */}
      <h2 className="mb-4 text-[19px] leading-snug font-bold text-slate-900">
        {request.requestName}
      </h2>

      {/* 미션 상세 정보를 정의 목록 형태로 표시합니다. */}
      <dl className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div className="min-w-0 rounded-[14px] bg-slate-50 p-3">
          <dt className="mb-1 text-xs font-black text-slate-400">의뢰자</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-slate-700">
            {request.requesterId ? (
              <a
                className="inline-flex items-center gap-1 font-black text-indigo-700 underline decoration-indigo-300 underline-offset-4 transition hover:text-indigo-950"
                href={getDiscordUserWebUrl(request.requesterId)}
                onClick={(event) => openDiscordDm(event, request.requesterId)}
                aria-label={`${request.requester}에게 Discord DM 보내기`}
                title="Discord 앱으로 먼저 열고, 실패하면 웹 프로필로 이동합니다."
              >
                {request.requester}
                <span aria-hidden="true">↗</span>
              </a>
            ) : (
              request.requester
            )}
          </dd>
        </div>
        <div className="min-w-0 rounded-[14px] bg-slate-50 p-3">
          <dt className="mb-1 text-xs font-black text-slate-400">보상</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-slate-700">
            {request.reward}
          </dd>
        </div>
        <div className="min-w-0 rounded-[14px] bg-slate-50 p-3">
          <dt className="mb-1 text-xs font-black text-slate-400">보수횟수</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-slate-700">
            {request.rewardCount}
          </dd>
        </div>
        <div className="col-span-full min-w-0 rounded-[14px] bg-slate-50 p-3">
          <dt className="mb-1 text-xs font-black text-slate-400">의뢰설명</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-slate-700">
            {request.description}
          </dd>
        </div>
      </dl>

      {/* 추후 미션 수행 보고 플로우로 연결될 버튼입니다. */}
      <div className="mt-4 flex justify-end">
        <button
          className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 transition hover:-translate-y-px hover:bg-red-100 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-red-50 disabled:hover:text-red-700"
          type="button"
          disabled={!missionId}
          onClick={handleMissionProofClick}
          aria-label={`${request.requestName} 의뢰보고`}
          title={
            missionId
              ? `${request.requestName} 의뢰보고`
              : "미션 식별자가 없어 의뢰보고를 열 수 없습니다."
          }
        >
          의뢰보고
        </button>
      </div>
    </article>
  );
};

export default MissionCard;
