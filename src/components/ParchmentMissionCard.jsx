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

// 카드 상단 배지에 표시할 길드 이름
const MissionCard = ({ request, guild, actionVariant = "proof" }) => {
  const navigate = useNavigate();
  const cancelMissionMutation = useCancelMission();
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
          <button
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-red-950/35 bg-red-950/10 px-4 text-sm font-black text-red-950 shadow-[0_5px_12px_rgba(69,10,10,0.12),inset_0_1px_0_rgba(255,255,255,0.22)] transition hover:-translate-y-px hover:bg-red-950/15 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-red-950/10"
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
          <button
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-stone-900/30 bg-stone-900/10 px-4 text-sm font-black text-stone-900 shadow-[0_5px_12px_rgba(41,37,36,0.12),inset_0_1px_0_rgba(255,255,255,0.22)] transition hover:-translate-y-px hover:bg-stone-900/15 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-stone-900/10"
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
            <p className="basis-full rounded-[12px] border border-red-950/25 bg-red-950/10 px-4 py-3 text-sm font-bold text-red-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
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
          className="inline-flex min-h-10 cursor-pointer items-center rounded-[10px] border border-red-950/35 bg-red-950/10 px-4 text-sm font-black text-red-950 shadow-[0_5px_12px_rgba(69,10,10,0.12),inset_0_1px_0_rgba(255,255,255,0.22)] transition hover:-translate-y-px hover:bg-red-950/15 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-red-950/10"
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
    <article
      className="relative flex h-full min-w-0 flex-col overflow-hidden border border-stone-950/35 bg-[#ebe3cd] p-5 text-stone-950 shadow-[0_18px_34px_rgba(92,55,30,0.22),inset_0_0_0_1px_rgba(255,248,222,0.58),inset_0_0_36px_rgba(146,107,82,0.18)] transition [background:radial-gradient(circle_at_50%_34%,rgba(255,253,231,0.68),transparent_14rem),radial-gradient(circle_at_10%_12%,rgba(177,132,100,0.18),transparent_7rem),radial-gradient(circle_at_88%_10%,rgba(146,107,82,0.16),transparent_6rem),radial-gradient(circle_at_78%_88%,rgba(211,156,109,0.18),transparent_8rem),radial-gradient(circle_at_22%_88%,rgba(146,107,82,0.12),transparent_7rem),linear-gradient(135deg,#f5eccd_0%,#e3c99d_48%,#f1ead6_100%)] [clip-path:polygon(1.2%_0%,18%_1%,36%_0.2%,53%_1.1%,71%_0.3%,98.5%_1.2%,100%_4%,99.1%_22%,100%_41%,98.8%_64%,100%_83%,98.2%_100%,76%_98.9%,52%_100%,30%_99.1%,1.4%_100%,0%_95%,1%_74%,0%_51%,1.1%_28%,0%_4%)] hover:-translate-y-0.5 hover:border-stone-950/45 hover:shadow-[0_22px_42px_rgba(92,55,30,0.28),inset_0_0_0_1px_rgba(255,248,222,0.62),inset_0_0_40px_rgba(146,107,82,0.22)]"
      key={request.requestNumber}
    >
      <div
        className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(0deg,rgba(146,107,82,0.08)_0_1px,transparent_1px_4px),repeating-linear-gradient(90deg,rgba(211,156,109,0.07)_0_1px,transparent_1px_5px)] opacity-25"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-4 opacity-75 [background:linear-gradient(90deg,rgba(96,45,30,0.46),rgba(211,156,109,0.18)_12%,rgba(146,107,82,0.32)_23%,rgba(255,248,222,0.08)_34%,rgba(177,132,100,0.3)_51%,rgba(211,156,109,0.18)_72%,rgba(96,45,30,0.42)),radial-gradient(circle_at_18%_0%,rgba(82,39,26,0.28),transparent_1.1rem),radial-gradient(circle_at_74%_0%,rgba(82,39,26,0.24),transparent_1.3rem)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-4 opacity-[0.72] [background:linear-gradient(90deg,rgba(96,45,30,0.44),rgba(245,236,205,0.04)_16%,rgba(211,156,109,0.34)_31%,rgba(146,107,82,0.22)_46%,rgba(255,248,222,0.06)_62%,rgba(96,45,30,0.4)),radial-gradient(circle_at_34%_100%,rgba(82,39,26,0.25),transparent_1.2rem),radial-gradient(circle_at_91%_100%,rgba(82,39,26,0.22),transparent_1rem)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-4 opacity-[0.68] [background:linear-gradient(180deg,rgba(96,45,30,0.42),rgba(245,236,205,0.04)_18%,rgba(177,132,100,0.28)_36%,rgba(96,45,30,0.42)_59%,rgba(245,236,205,0.04)_74%,rgba(96,45,30,0.38)),radial-gradient(circle_at_0%_28%,rgba(82,39,26,0.24),transparent_1.1rem),radial-gradient(circle_at_0%_78%,rgba(82,39,26,0.2),transparent_1rem)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-4 opacity-[0.68] [background:linear-gradient(180deg,rgba(96,45,30,0.38),rgba(211,156,109,0.18)_19%,rgba(245,236,205,0.05)_35%,rgba(96,45,30,0.42)_54%,rgba(177,132,100,0.22)_77%,rgba(96,45,30,0.38)),radial-gradient(circle_at_100%_19%,rgba(82,39,26,0.22),transparent_1rem),radial-gradient(circle_at_100%_68%,rgba(82,39,26,0.24),transparent_1.2rem)]"
        aria-hidden="true"
      />

      {/* 미션 번호와 선택 길드를 한눈에 볼 수 있는 상단 배지 영역입니다. */}
      <div className="relative z-10 mb-3 flex items-center justify-between gap-2.5 max-[560px]:flex-col max-[560px]:items-stretch">
        <span className="inline-flex min-h-7 items-center rounded-[9px] border border-stone-950/35 bg-stone-950/15 px-2.5 text-xs font-black whitespace-nowrap text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          {request.requestNumber}
        </span>
        <span className="inline-flex min-h-7 items-center rounded-[9px] border border-emerald-950/30 bg-emerald-950/15 px-2.5 text-xs font-black whitespace-nowrap text-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          {getGuildDisplayName(guild)}
        </span>
      </div>

      {/* 미션 제목입니다. */}
      <h2
        className="relative z-10 mb-4 line-clamp-2 min-h-[5rem] border-b border-stone-950/30 pb-3 font-serif text-[21px] leading-snug font-black tracking-[-0.01em] text-stone-950"
        title={request.requestName}
      >
        {request.requestName}
      </h2>

      {/* 미션 상세 정보를 정의 목록 형태로 표시합니다. */}
      <dl className="relative z-10 grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <div className="min-w-0 rounded-[10px] border border-stone-950/18 bg-[#f3e6c6]/68 p-3 shadow-[inset_0_1px_0_rgba(255,248,222,0.45),inset_0_0_14px_rgba(146,107,82,0.1)]">
          <dt className="mb-1 text-xs font-black text-orange-900">의뢰자</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-stone-950">
            {request.requesterId ? (
              <a
                className="inline-flex items-center gap-1 font-black text-stone-900 underline decoration-red-900/35 underline-offset-4 transition hover:text-red-950"
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
        <div className="min-w-0 rounded-[10px] border border-stone-950/18 bg-[#f3e6c6]/68 p-3 shadow-[inset_0_1px_0_rgba(255,248,222,0.45),inset_0_0_14px_rgba(146,107,82,0.1)]">
          <dt className="mb-1 text-xs font-black text-orange-900">보상</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-stone-950">
            {request.reward}
          </dd>
        </div>
        <div className="min-w-0 rounded-[10px] border border-stone-950/18 bg-[#f3e6c6]/68 p-3 shadow-[inset_0_1px_0_rgba(255,248,222,0.45),inset_0_0_14px_rgba(146,107,82,0.1)]">
          <dt className="mb-1 text-xs font-black text-orange-900">보수횟수</dt>
          <dd className="m-0 text-sm font-bold [overflow-wrap:anywhere] text-stone-950">
            {request.rewardCount}
          </dd>
        </div>
        <div className="col-span-full min-w-0 rounded-[10px] border border-stone-950/18 bg-[#f3e6c6]/68 p-3 shadow-[inset_0_1px_0_rgba(255,248,222,0.45),inset_0_0_14px_rgba(146,107,82,0.1)]">
          <dt className="mb-1 text-xs font-black text-orange-900">의뢰설명</dt>
          <dd className="m-0 text-sm leading-6 font-bold [overflow-wrap:anywhere] text-stone-950">
            {request.description}
          </dd>
        </div>
      </dl>

      {/* 목록 성격에 따라 카드 하단 액션을 다르게 표시합니다. */}
      {renderCardActions()}
    </article>
  );
};

export default MissionCard;
