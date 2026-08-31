import { useEffect, useMemo, useState } from "react";
import MissionReportEvidenceBoard from "./MissionReportEvidenceBoard";

const STATUS_LABELS = {
  PENDING: "검토 대기",
  WAITING: "검토 대기",
  WAITING_REVIEW: "검토 대기",
  REVIEWING: "검토 중",
  APPROVED: "확인 완료",
  ACCEPTED: "확인 완료",
  COMPLETED: "확인 완료",
  REJECTED: "반려",
  DENIED: "반려",
  CANCELED: "취소",
  CANCELLED: "취소",
};

const toText = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
};

const getStatusLabel = (status) => {
  const normalizedStatus = toText(status).trim();

  if (!normalizedStatus) {
    return "상태 없음";
  }

  return (
    STATUS_LABELS[normalizedStatus] ??
    STATUS_LABELS[normalizedStatus.toUpperCase()] ??
    normalizedStatus
  );
};

const getStatusTone = (status) => {
  const normalizedStatus = toText(status).toUpperCase();

  if (
    normalizedStatus.includes("APPROV") ||
    normalizedStatus.includes("ACCEPT") ||
    normalizedStatus.includes("COMPLETE") ||
    normalizedStatus.includes("SUCCESS")
  ) {
    return "success";
  }

  if (
    normalizedStatus.includes("REJECT") ||
    normalizedStatus.includes("DENY") ||
    normalizedStatus.includes("FAIL") ||
    normalizedStatus.includes("CANCEL")
  ) {
    return "danger";
  }

  if (
    normalizedStatus.includes("PENDING") ||
    normalizedStatus.includes("WAIT") ||
    normalizedStatus.includes("REVIEW")
  ) {
    return "warning";
  }

  return "default";
};

const getStatusClassName = (status) => {
  const statusTone = getStatusTone(status);

  if (statusTone === "success") {
    return "border-emerald-300 bg-emerald-100 text-emerald-800";
  }

  if (statusTone === "warning") {
    return "border-amber-300 bg-amber-100 text-amber-900";
  }

  if (statusTone === "danger") {
    return "border-red-300 bg-red-100 text-red-800";
  }

  return "border-slate-300 bg-slate-100 text-slate-700";
};

const getColumnCountFromViewport = () => {
  if (typeof window === "undefined") {
    return 3;
  }

  if (window.matchMedia("(max-width: 720px)").matches) {
    return 1;
  }

  if (window.matchMedia("(max-width: 1180px)").matches) {
    return 2;
  }

  return 3;
};

const getSubmissionFiles = (submission) => {
  return Array.isArray(submission?.bountyMissionFileServiceDtoList)
    ? submission.bountyMissionFileServiceDtoList
    : [];
};

const getSubmissionId = (submission) => {
  return toText(submission?.submissionId);
};

const getHunterDiscordUserId = (submission) => {
  return toText(submission?.hunterDiscordUserId).trim();
};

const getHunterDisplayName = (submission) => {
  return getHunterDiscordUserId(submission) || "알 수 없는 헌터";
};

const getHunterAvatarText = (submission) => {
  const hunterDiscordUserId = getHunterDiscordUserId(submission);

  if (!hunterDiscordUserId) {
    return "헌터";
  }

  if (/^\d+$/.test(hunterDiscordUserId)) {
    return hunterDiscordUserId.slice(-2).padStart(2, "0");
  }

  return Array.from(hunterDiscordUserId.replace(/^@/, ""))
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const formatCreatedAt = (createdAt) => {
  const createdAtText = toText(createdAt).trim();

  if (!createdAtText) {
    return "-";
  }

  const localDateTimeMatch = createdAtText.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/,
  );

  if (localDateTimeMatch) {
    return `${localDateTimeMatch[2]}/${localDateTimeMatch[3]} ${localDateTimeMatch[4]}:${localDateTimeMatch[5]}`;
  }

  const parsedDate = new Date(createdAtText);

  if (!Number.isNaN(parsedDate.getTime())) {
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const date = String(parsedDate.getDate()).padStart(2, "0");
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

    return `${month}/${date} ${hours}:${minutes}`;
  }

  return createdAtText;
};

const chunkSubmissions = (submissions, columnCount) => {
  const rows = [];

  for (let index = 0; index < submissions.length; index += columnCount) {
    rows.push(submissions.slice(index, index + columnCount));
  }

  return rows;
};

const MissionReportHunterList = ({
  canReviewSubmission,
  guildId,
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
}) => {
  const [columnCount, setColumnCount] = useState(getColumnCountFromViewport);
  const submissionRows = useMemo(
    () => chunkSubmissions(submissions, columnCount),
    [columnCount, submissions],
  );

  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCountFromViewport());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section aria-labelledby="mission-report-hunter-list-title">
      <div className="mb-4 flex items-end justify-between gap-3 max-[560px]:flex-col max-[560px]:items-start">
        <div>
          <p className="mb-1 text-xs font-black tracking-[0.14em] text-amber-300 uppercase">
            Hunters
          </p>
          <h2
            className="text-[24px] leading-tight font-black text-stone-100"
            id="mission-report-hunter-list-title"
          >
            보고한 헌터
          </h2>
        </div>
        <span className="rounded-full border border-amber-300/30 bg-amber-200/10 px-3 py-1.5 text-sm font-black text-amber-100">
          {submissions.length}명
        </span>
      </div>

      <div className="space-y-3">
        {submissionRows.map((submissionRow) => {
          const selectedSubmission = submissionRow.find(
            (submission) =>
              selectedSubmissionId === getSubmissionId(submission),
          );

          return (
            <div
              key={submissionRow
                .map((submission) => getSubmissionId(submission))
                .join("-")}
            >
              <div className="grid grid-cols-3 gap-3 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1">
                {submissionRow.map((submission) => {
                  const submissionId = getSubmissionId(submission);
                  const hunterDisplayName = getHunterDisplayName(submission);
                  const hunterDiscordUserId =
                    getHunterDiscordUserId(submission);
                  const isSelected = selectedSubmissionId === submissionId;
                  const fileCount = getSubmissionFiles(submission).length;

                  return (
                    <button
                      className={`group min-h-[178px] cursor-pointer rounded-[22px] border p-4 text-left shadow-[0_14px_26px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-amber-300/70 ${
                        isSelected
                          ? "border-amber-300 bg-amber-950/70 ring-4 ring-amber-300/10"
                          : "border-stone-700 bg-stone-900/75"
                      }`}
                      key={submissionId}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        onSelectSubmission(isSelected ? "" : submissionId)
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 to-orange-700 px-1 text-center text-sm font-black text-stone-950 shadow-[0_8px_18px_rgba(0,0,0,0.22)]">
                          {getHunterAvatarText(submission)}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-black ${getStatusClassName(
                            submission.status,
                          )}`}
                        >
                          {getStatusLabel(submission.status)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-[18px] font-black text-stone-100 group-hover:text-amber-100">
                        {hunterDisplayName}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-stone-400">
                        {hunterDiscordUserId
                          ? `@${hunterDiscordUserId}`
                          : "Discord ID 없음"}
                      </p>

                      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-2xl bg-black/20 px-3 py-2">
                          <dt className="text-xs font-black text-stone-500">
                            제출시각
                          </dt>
                          <dd className="mt-1 font-bold text-stone-200">
                            {formatCreatedAt(submission.createdAt)}
                          </dd>
                        </div>
                        <div className="rounded-2xl bg-black/20 px-3 py-2">
                          <dt className="text-xs font-black text-stone-500">
                            첨부
                          </dt>
                          <dd className="mt-1 font-bold text-stone-200">
                            {fileCount}개
                          </dd>
                        </div>
                      </dl>
                    </button>
                  );
                })}
              </div>

              {selectedSubmission ? (
                <div
                  className="mt-3"
                  aria-label={`${getHunterDisplayName(selectedSubmission)} 보고 상세`}
                >
                  <MissionReportEvidenceBoard
                    key={getSubmissionId(selectedSubmission)}
                    canReviewSubmission={canReviewSubmission}
                    guildId={guildId}
                    submission={selectedSubmission}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MissionReportHunterList;
