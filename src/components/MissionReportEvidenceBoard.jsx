import { useState } from "react";
import { useCreateMissionSubmissionReview } from "../hooks/mutations/use-create-mission-submission-review";

const IMAGE_FILE_EXTENSIONS = new Set([
  "AVIF",
  "BMP",
  "GIF",
  "JPEG",
  "JPG",
  "PNG",
  "SVG",
  "WEBP",
]);

const toText = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
};

const getAttachmentRotateClassName = (index) => {
  const rotateClassNames = [
    "-rotate-1",
    "rotate-1",
    "-rotate-2",
    "rotate-2",
    "rotate-0",
  ];

  return rotateClassNames[index % rotateClassNames.length];
};

const getSubmissionFiles = (submission) => {
  return Array.isArray(submission?.bountyMissionFileServiceDtoList)
    ? submission.bountyMissionFileServiceDtoList
    : [];
};

const getHunterDisplayName = (submission) => {
  return toText(submission?.hunterDiscordUserId).trim() || "알 수 없는 헌터";
};

const getSubmissionId = (submission) => {
  return toText(submission?.submissionId).trim();
};

const getFileName = (file, index) => {
  return toText(file?.originFileName).trim() || `첨부파일 ${index + 1}`;
};

const getFileUrl = (file) => {
  return toText(file?.fileUrl).trim();
};

const getFileExtension = (fileName) => {
  const extension = fileName.split(".").pop()?.trim().toUpperCase();

  if (!extension || extension === fileName.toUpperCase()) {
    return "FILE";
  }

  return extension;
};

const isImageFile = (fileName) => {
  return IMAGE_FILE_EXTENSIONS.has(getFileExtension(fileName));
};

const getReviewErrorMessage = (error) => {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "보고 검토 요청에 실패했습니다."
  );
};

const MissionReportEvidenceBoard = ({
  canReviewSubmission = false,
  guildId,
  submission,
}) => {
  const [reviewNote, setReviewNote] = useState("");
  const [reviewAction, setReviewAction] = useState("");
  const reviewMutation = useCreateMissionSubmissionReview();
  const files = getSubmissionFiles(submission);
  const hasProofText = Boolean(submission.proofText?.trim());
  const hasFiles = files.length > 0;
  const hunterDisplayName = getHunterDisplayName(submission);
  const submissionId = getSubmissionId(submission);
  const isReviewPending = reviewMutation.isPending;
  const canSubmitReview =
    canReviewSubmission && Boolean(submissionId && guildId) && !isReviewPending;

  const handleReviewNoteChange = (event) => {
    setReviewNote(event.target.value);

    if (reviewMutation.isError || reviewMutation.isSuccess) {
      reviewMutation.reset();
    }
  };

  const handleReviewClick = (approve) => {
    if (!canSubmitReview) {
      return;
    }

    setReviewAction(approve ? "approve" : "reject");
    reviewMutation.mutate(
      {
        submissionId,
        missionId: submission.missionId,
        guildId,
        note: reviewNote,
        approve,
      },
      {
        onSettled: () => setReviewAction(""),
      },
    );
  };

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-amber-900/50 bg-[#21150d] p-5 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.08),0_24px_54px_rgba(0,0,0,0.24)]"
      aria-labelledby="mission-report-evidence-title"
    >
      <div
        className="absolute inset-0 [background-size:auto,44px_44px,44px_44px] opacity-70 [background:radial-gradient(circle_at_16%_12%,rgba(251,191,36,0.10),transparent_16rem),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-5">
          <p className="mb-1 text-xs font-black tracking-[0.14em] text-amber-300 uppercase">
            Evidence Board
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className="text-[24px] leading-tight font-black text-stone-100"
              id="mission-report-evidence-title"
            >
              {hunterDisplayName}의 의뢰 보고
            </h2>
            <span className="rounded-full bg-stone-950/70 px-3 py-1.5 text-sm font-black text-amber-100 ring-1 ring-amber-300/20">
              {files.length}개 첨부
            </span>
          </div>
        </div>

        {hasProofText ? (
          <div className="mb-6 rounded-[20px] border border-amber-200/20 bg-[#efe1c2] p-5 text-stone-900 shadow-[0_12px_24px_rgba(0,0,0,0.20)]">
            <div
              className="mx-auto mb-3 h-3 w-3 rounded-full bg-red-800 shadow-[0_2px_8px_rgba(127,29,29,0.45)]"
              aria-hidden="true"
            />
            <p className="mb-2 text-sm font-black text-stone-500">보고 내용</p>
            <p className="text-base leading-7 font-bold whitespace-pre-line text-stone-800">
              {submission.proofText}
            </p>
          </div>
        ) : null}

        {hasFiles ? (
          <div className="grid grid-cols-3 gap-5 max-[1180px]:grid-cols-2 max-[720px]:grid-cols-1">
            {files.map((file, index) => {
              const rotateClassName = getAttachmentRotateClassName(index);
              const fileName = getFileName(file, index);
              const fileUrl = getFileUrl(file);
              const fileExtension = getFileExtension(fileName);
              const attachmentKey = `${submission.submissionId}-${fileName}-${index}`;

              if (isImageFile(fileName) && fileUrl) {
                return (
                  <figure
                    className={`relative rounded-sm bg-[#f3ead8] p-2 shadow-[0_10px_22px_rgba(0,0,0,0.26)] transition hover:-translate-y-1 hover:rotate-0 ${rotateClassName}`}
                    key={attachmentKey}
                  >
                    <span
                      className="absolute top-2 left-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-amber-800 shadow-[0_2px_7px_rgba(0,0,0,0.35)] ring-2 ring-amber-300/60"
                      aria-hidden="true"
                    />
                    <a
                      className="block"
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="첨부파일 새 창에서 열기"
                    >
                      <img
                        className="h-48 w-full rounded-sm object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
                        src={fileUrl}
                        alt={fileName}
                      />
                    </a>
                    <figcaption className="px-2 pt-3 pb-1 text-center text-sm font-black break-all text-stone-700">
                      {fileName}
                    </figcaption>
                  </figure>
                );
              }

              return (
                <article
                  className={`relative flex min-h-[260px] flex-col justify-between rounded-sm bg-[#efe1c2] p-5 shadow-[0_10px_22px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:rotate-0 ${rotateClassName}`}
                  key={attachmentKey}
                >
                  <span
                    className="absolute top-3 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-red-800 shadow-[0_2px_7px_rgba(0,0,0,0.35)]"
                    aria-hidden="true"
                  />

                  <div className="pt-5">
                    <span className="inline-flex rounded-xl border border-stone-400/50 bg-stone-100/70 px-3 py-1 text-xs font-black tracking-[0.12em] text-stone-600 uppercase shadow-[0_3px_8px_rgba(0,0,0,0.08)]">
                      {fileExtension}
                    </span>
                    <h3 className="mt-5 text-[20px] leading-tight font-black break-all text-stone-900">
                      {fileName}
                    </h3>
                    <p className="mt-3 text-sm leading-6 font-bold text-stone-600">
                      보고 id {file.submissionId ?? submission.submissionId}에
                      연결된 첨부파일입니다.
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-stone-300/70 bg-stone-100/65 p-3">
                    <p className="text-xs font-black text-stone-500">
                      파일 URL
                    </p>
                    {fileUrl ? (
                      <a
                        className="mt-1 block text-sm font-black break-all text-stone-800 underline decoration-stone-400 underline-offset-4 transition hover:text-red-950"
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {fileUrl}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-bold text-stone-700">
                        파일 URL이 없습니다.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-amber-200/20 bg-black/15 p-6 text-center shadow-[0_10px_22px_rgba(0,0,0,0.16)]">
            <p className="text-sm font-black text-stone-300">
              {hasProofText
                ? "첨부파일 없이 보고 내용만 제출된 보고입니다."
                : "보고 내용과 첨부파일이 없는 보고입니다."}
            </p>
          </div>
        )}

        {canReviewSubmission ? (
          <div className="mt-6 rounded-[20px] border border-amber-200/20 bg-black/20 p-5 shadow-[0_10px_22px_rgba(0,0,0,0.16)]">
            <label
              className="mb-2 block text-sm font-black text-amber-100"
              htmlFor={`mission-report-comment-${submissionId}`}
            >
              의뢰자 코멘트
            </label>
            <textarea
              className="min-h-28 w-full resize-y rounded-2xl border border-amber-200/20 bg-[#efe1c2] p-4 text-sm font-bold text-stone-900 shadow-[inset_0_1px_4px_rgba(0,0,0,0.12)] transition outline-none placeholder:text-stone-500 focus:border-amber-300/60 focus:ring-4 focus:ring-amber-300/10"
              id={`mission-report-comment-${submissionId}`}
              key={submissionId}
              placeholder="헌터의 보고에 대한 코멘트를 입력해 주세요."
              value={reviewNote}
              onChange={handleReviewNoteChange}
            />

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 max-[560px]:flex-col max-[560px]:items-stretch">
              <button
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-400/15 px-5 text-sm font-black text-emerald-100 transition hover:-translate-y-px hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-emerald-400/15"
                type="button"
                disabled={!canSubmitReview}
                onClick={() => handleReviewClick(true)}
              >
                {isReviewPending && reviewAction === "approve"
                  ? "완료 중..."
                  : "완료"}
              </button>
              <button
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-red-300/40 bg-red-400/15 px-5 text-sm font-black text-red-100 transition hover:-translate-y-px hover:bg-red-400/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-red-400/15"
                type="button"
                disabled={!canSubmitReview}
                onClick={() => handleReviewClick(false)}
              >
                {isReviewPending && reviewAction === "reject"
                  ? "거부 중..."
                  : "거부"}
              </button>
            </div>

            {!guildId ? (
              <p className="mt-3 text-sm font-bold text-red-200">
                길드 정보를 찾을 수 없어 검토 요청을 보낼 수 없습니다.
              </p>
            ) : null}
            {reviewMutation.isSuccess ? (
              <p className="mt-3 text-sm font-bold text-emerald-200">
                보고 검토 요청이 완료되었습니다.
              </p>
            ) : null}
            {reviewMutation.error ? (
              <p className="mt-3 text-sm font-bold text-red-200">
                {getReviewErrorMessage(reviewMutation.error)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default MissionReportEvidenceBoard;
