import { useMemo, useState } from "react";
import { useMissionSubmissionsData } from "../hooks/queries/use-mission-submissions-data";
import MissionReportHunterList from "./MissionReportHunterList";
import MissionReportMissionCard from "./MissionReportMissionCard";

const EMPTY_SUBMISSIONS = [];

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
      mission?.missionId,
      mission?.id,
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

const getMissionStatus = (mission) => {
  return toText(
    firstPresentValue(
      mission?.status,
      mission?.missionStatus,
      mission?.mission_status,
      mission?.bountyMissionStatus,
      mission?.bounty_mission_status,
    ),
  )
    .trim()
    .toUpperCase();
};

const getSubmissionList = (submissionsResponse) => {
  if (Array.isArray(submissionsResponse?.data)) {
    return submissionsResponse.data;
  }

  if (Array.isArray(submissionsResponse?.data?.submissions)) {
    return submissionsResponse.data.submissions;
  }

  if (Array.isArray(submissionsResponse?.data?.content)) {
    return submissionsResponse.data.content;
  }

  if (Array.isArray(submissionsResponse?.submissions)) {
    return submissionsResponse.submissions;
  }

  if (Array.isArray(submissionsResponse?.content)) {
    return submissionsResponse.content;
  }

  if (Array.isArray(submissionsResponse)) {
    return submissionsResponse;
  }

  return EMPTY_SUBMISSIONS;
};

const getSubmissionFiles = (submission) => {
  const files = firstPresentValue(
    submission?.bountyMissionFileServiceDtoList,
    submission?.files,
    submission?.attachments,
  );

  return Array.isArray(files) ? files : [];
};

const normalizeMissionFile = (file, submissionId) => {
  return {
    submissionId: file?.submissionId ?? submissionId,
    originFileName: firstPresentValue(
      file?.originFileName,
      file?.origin_file_name,
      file?.fileName,
      file?.name,
      "첨부파일",
    ),
    fileUrl: firstPresentValue(file?.fileUrl, file?.file_url, file?.url, ""),
  };
};

const normalizeSubmission = (submission, index, fallbackMissionId) => {
  const submissionId = firstPresentValue(
    submission?.submissionId,
    submission?.id,
    `submission-${index + 1}`,
  );

  return {
    submissionId,
    missionId: firstPresentValue(
      submission?.missionId,
      submission?.mission_id,
      fallbackMissionId,
    ),
    hunterDiscordUserId: toText(
      firstPresentValue(
        submission?.hunterDiscordUserId,
        submission?.hunter_discord_user_id,
        submission?.discordUserId,
        submission?.discord_user_id,
      ),
    ),
    proofText: submission?.proofText ?? submission?.proof_text ?? "",
    status: firstPresentValue(submission?.status, "PENDING"),
    createdAt: firstPresentValue(
      submission?.createdAt,
      submission?.created_at,
      submission?.submittedAt,
      submission?.submitted_at,
      "",
    ),
    bountyMissionFileServiceDtoList: getSubmissionFiles(submission).map(
      (file) => normalizeMissionFile(file, submissionId),
    ),
  };
};

const normalizeSubmissions = (submissionsResponse, missionId) => {
  return getSubmissionList(submissionsResponse).map((submission, index) =>
    normalizeSubmission(submission, index, missionId),
  );
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "헌터 보고 목록을 불러오지 못했습니다."
  );
};

const MissionReportReviewBoard = ({ mission, guild, onBack }) => {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");
  const missionId = getMissionId(mission);
  const canReviewSubmission = getMissionStatus(mission) === "OPEN";
  const submissionsQuery = useMissionSubmissionsData(missionId);
  const submissions = useMemo(
    () => normalizeSubmissions(submissionsQuery.data, missionId),
    [missionId, submissionsQuery.data],
  );

  return (
    <section className="space-y-5">
      <MissionReportMissionCard
        mission={mission}
        guild={guild}
        onBack={onBack}
      />

      <div className="overflow-hidden rounded-[30px] border border-stone-800 bg-[#120d09] text-stone-100 shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
        <div className="relative border-b border-amber-900/40 p-6 max-[640px]:p-5">
          <div
            className="absolute inset-0 opacity-90 [background:radial-gradient(circle_at_12%_0%,rgba(251,191,36,0.16),transparent_26rem),linear-gradient(135deg,#19110b,#0b0907_62%,#22160d)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"
            aria-hidden="true"
          />

          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-black tracking-[0.16em] text-amber-300 uppercase">
                Report Review
              </p>
              <h2 className="text-[28px] leading-tight font-black text-stone-50 max-[640px]:text-[24px]">
                헌터 보고 목록
              </h2>
              <p className="mt-2 text-sm font-bold text-stone-400">
                선택한 미션을 수행한 헌터들입니다.
              </p>
            </div>

            <div className="rounded-[22px] border border-amber-300/20 bg-black/25 p-4 text-right shadow-[0_12px_24px_rgba(0,0,0,0.16)] max-[720px]:text-left">
              <p className="text-xs font-black tracking-[0.14em] text-stone-500 uppercase">
                Total Reports
              </p>
              <p className="mt-1 text-[30px] font-black text-amber-100">
                {submissionsQuery.isPending ? "-" : submissions.length}
              </p>
              {submissionsQuery.isFetching && !submissionsQuery.isPending ? (
                <p className="mt-1 text-xs font-black text-amber-300/80">
                  새로고침 중
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6 max-[640px]:p-5">
          {submissionsQuery.isPending ? (
            <div className="rounded-[24px] border border-amber-300/20 bg-stone-900/70 p-6 text-center shadow-[0_14px_28px_rgba(0,0,0,0.18)]">
              <p className="text-sm font-black text-stone-200">
                헌터 보고 목록을 불러오는 중입니다.
              </p>
            </div>
          ) : null}

          {submissionsQuery.error ? (
            <div className="rounded-[24px] border border-red-300/30 bg-red-950/30 p-6 text-center shadow-[0_14px_28px_rgba(0,0,0,0.18)]">
              <p className="text-sm font-black text-red-100">
                {getErrorMessage(submissionsQuery.error)}
              </p>
              <button
                className="mt-4 inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-red-200/30 bg-red-100/10 px-4 text-sm font-black text-red-50 transition hover:-translate-y-px hover:bg-red-100/15"
                type="button"
                onClick={() => submissionsQuery.refetch()}
              >
                다시 불러오기
              </button>
            </div>
          ) : null}

          {!submissionsQuery.isPending && !submissionsQuery.error ? (
            submissions.length > 0 ? (
              <MissionReportHunterList
                canReviewSubmission={canReviewSubmission}
                guildId={getGuildId(guild)}
                submissions={submissions}
                selectedSubmissionId={selectedSubmissionId}
                onSelectSubmission={setSelectedSubmissionId}
              />
            ) : (
              <div className="rounded-[24px] border border-dashed border-amber-300/25 bg-black/20 p-8 text-center shadow-[0_14px_28px_rgba(0,0,0,0.16)]">
                <p className="text-base font-black text-stone-100">
                  아직 제출된 헌터 보고가 없습니다.
                </p>
              </div>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default MissionReportReviewBoard;
