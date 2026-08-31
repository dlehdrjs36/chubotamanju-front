import { useNavigate } from "react-router-dom";
import { useCancelMission } from "../../hooks/mutations/use-cancel-mission";

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

const getGuildDisplayName = (guild) => {
  const displayName = firstPresentValue(
    guild?.guildName,
    guild?.guild_name,
    guild?.name,
    guild?.displayName,
    guild?.display_name,
    guild?.serverName,
    guild?.server_name,
  );

  if (displayName) {
    return displayName;
  }

  if (!getGuildId(guild)) {
    return "길드 미선택";
  }

  return "이름 없는 길드";
};

const getDescription = (request) => {
  return request.description || "등록된 의뢰 설명이 없습니다.";
};

const getMissionStatus = (mission) => {
  return toText(
    firstPresentValue(
      mission?.status,
      mission?.missionStatus,
      mission?.mission_status,
    ),
  )
    .trim()
    .toUpperCase();
};

const isCancelableMission = (mission) => {
  const missionStatus = getMissionStatus(mission);

  return !["COMPLETED", "CANCEL", "CANCELED", "CANCELLED"].includes(
    missionStatus,
  );
};

// 카드 상단 배지에 표시할 길드 이름
const MissionCard = ({ request, guild, actionVariant = "proof" }) => {
  const navigate = useNavigate();
  const cancelMissionMutation = useCancelMission();
  const missionId = getMissionId(request);
  const guildId = getGuildId(guild);
  const canCancelMission = isCancelableMission(request);

  // Discord 웹 프로필 fallback URL입니다.
  const getDiscordUserWebUrl = (discordUserId) =>
    `https://discord.com/users/${discordUserId}`;

  // Discord 앱을 먼저 열기 위한 deep link URL입니다.
  const getDiscordUserAppUrl = (discordUserId) =>
    `discord://-/users/${discordUserId}`;

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

  const handleMissionCancelClick = () => {
    if (!missionId || cancelMissionMutation.isPending) {
      return;
    }

    cancelMissionMutation.mutate({
      missionId,
      guildId,
    });
  };

  const handleMissionReportReviewClick = () => {
    if (!missionId) {
      return;
    }

    const search = guildId ? `?guildId=${encodeURIComponent(guildId)}` : "";

    navigate(`/missions/${encodeURIComponent(missionId)}/reports${search}`, {
      state: {
        mission: request,
        guild,
      },
    });
  };

  const renderCardActions = () => {
    if (actionVariant === "owner") {
      return (
        <div className="mt-auto flex flex-wrap justify-end gap-2 pt-4 max-[560px]:flex-col">
          {canCancelMission ? (
            <button
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-black text-red-600 transition hover:-translate-y-px hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-white"
              type="button"
              disabled={!missionId || cancelMissionMutation.isPending}
              onClick={handleMissionCancelClick}
              aria-label={`${request.requestName} 의뢰취소`}
              title={
                missionId
                  ? `${request.requestName} 의뢰취소`
                  : "미션 식별자가 없어 의뢰취소를 할 수 없습니다."
              }
            >
              {cancelMissionMutation.isPending ? "취소 중..." : "의뢰취소"}
            </button>
          ) : null}
          <button
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-white"
            type="button"
            disabled={!missionId}
            onClick={handleMissionReportReviewClick}
            aria-label={`${request.requestName} 보고확인`}
            title={
              missionId
                ? `${request.requestName} 보고확인`
                : "미션 식별자가 없어 보고확인을 할 수 없습니다."
            }
          >
            보고확인
          </button>
          {cancelMissionMutation.error ? (
            <p className="basis-full rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {cancelMissionMutation.error?.response?.data?.message ??
                cancelMissionMutation.error?.message ??
                "의뢰취소에 실패했습니다."}
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <div className="mt-auto flex justify-end pt-4">
        <button
          className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-white"
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
    );
  };

  return (
    <article className="flex h-full min-w-0 flex-col rounded-[20px] border border-slate-200 bg-white p-[18px] text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.09)]">
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
      <h2
        className="mb-4 line-clamp-2 min-h-[3.25rem] text-[19px] leading-snug font-bold text-slate-900"
        title={request.requestName}
      >
        {request.requestName}
      </h2>

      {/* 미션 상세 정보를 정의 목록 형태로 표시합니다. */}
      <dl className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div className="min-w-0 rounded-[14px] bg-slate-50 p-3">
          <dt className="mb-1 text-xs font-black text-slate-400">의뢰자</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-slate-700">
            {request.requesterId ? (
              <a
                className="inline-flex items-center gap-1 font-black text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-indigo-700"
                href={getDiscordUserWebUrl(request.requesterId)}
                onClick={(event) => openDiscordDm(event, request.requesterId)}
                aria-label={`${request.requester}에게 Discord DM 보내기`}
                title="Discord 앱으로 먼저 열고, 실패하면 웹 프로필로 이동합니다."
              >
                {request.requester}
                <span aria-hidden="true">↗</span>
              </a>
            ) : (
              (request.requester ?? "알 수 없음")
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
          <dd className="m-0 text-sm leading-6 font-bold [overflow-wrap:anywhere] text-slate-700">
            {getDescription(request)}
          </dd>
        </div>
      </dl>

      {/* 목록 성격에 따라 카드 하단 액션을 다르게 표시합니다. */}
      {renderCardActions()}
    </article>
  );
};

export default MissionCard;
