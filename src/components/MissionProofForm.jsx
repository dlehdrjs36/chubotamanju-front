import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateMissionProof } from "../hooks/mutations/use-create-mission-proof";
import { useMissionProofTarget } from "../hooks/use-mission-proof-target";
import MissionProofImageUploader from "./MissionProofImageUploader";
import MissionProofMissionSummary from "./MissionProofMissionSummary";

const normalizeMissionIdForPayload = (missionId) => {
  const numericMissionId = Number(missionId);

  if (Number.isNaN(numericMissionId)) {
    return missionId;
  }

  return numericMissionId;
};

const MissionProofForm = () => {
  const navigate = useNavigate();
  const { mission, missionId, guild, cancelPath } = useMissionProofTarget();
  const [proofText, setProofText] = useState("");
  const [
    bountyMissionFileCreateRequestList,
    setBountyMissionFileCreateRequestList,
  ] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const createMissionProofMutation = useCreateMissionProof();

  const handleMissionFilesChange = useCallback((nextMissionFiles) => {
    setBountyMissionFileCreateRequestList(nextMissionFiles);
  }, []);

  const handleProofImageUploadStateChange = useCallback((nextIsUploading) => {
    setIsUploadingImage(nextIsUploading);
  }, []);

  const handleCancel = () => {
    navigate(cancelPath);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedProofText = proofText.trim();
    if (
      !trimmedProofText &&
      bountyMissionFileCreateRequestList.length === 0
    ) {
      setFormErrorMessage("보고 내용 또는 이미지를 하나 이상 입력해 주세요.");
      return;
    }

    if (isUploadingImage) {
      setFormErrorMessage("이미지 업로드가 완료된 뒤 제출해 주세요.");
      return;
    }

    setFormErrorMessage("");

    try {
      await createMissionProofMutation.mutateAsync({
        missionId: normalizeMissionIdForPayload(missionId),
        proofText: trimmedProofText,
        bountyMissionFileCreateRequestList,
      });

      navigate(cancelPath);
    } catch (error) {
      setFormErrorMessage(
        error?.response?.data?.message ??
          error?.message ??
          "의뢰보고 제출에 실패했습니다.",
      );
    }
  };

  if (!mission) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/95 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <strong className="text-[20px] text-slate-800">
          보고할 미션 정보를 찾을 수 없습니다.
        </strong>
        <p className="mt-3 text-sm font-semibold text-slate-500">
          메인 화면에서 미션을 다시 선택해 주세요.
        </p>
        <button
          className="mt-6 min-h-11 cursor-pointer rounded-2xl bg-[#5865f2] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(88,101,242,0.24)] transition hover:-translate-y-px"
          type="button"
          onClick={() => navigate("/")}
        >
          메인으로 이동
        </button>
      </div>
    );
  }

  const errorMessage =
    formErrorMessage ||
    createMissionProofMutation.error?.response?.data?.message ||
    createMissionProofMutation.error?.message ||
    "";
  const isSubmitting = createMissionProofMutation.isPending;
  const isSubmitDisabled =
    isSubmitting ||
    isUploadingImage ||
    (!proofText.trim() && bountyMissionFileCreateRequestList.length === 0);

  return (
    <form
      className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] max-[640px]:p-5"
      onSubmit={handleSubmit}
    >
      <MissionProofMissionSummary mission={mission} guild={guild} />

      <div className="mt-8">
        <label className="block">
          <span className="mb-4 block text-[28px] font-black text-slate-900 max-[640px]:text-[24px]">
            보고 내용
          </span>
          <textarea
            className="min-h-[92px] w-full resize-y rounded-[18px] border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/15"
            value={proofText}
            onChange={(event) => setProofText(event.target.value)}
            placeholder="미션 수행 내용을 입력해 주세요."
          />
        </label>
      </div>

      <div className="mt-5">
        <MissionProofImageUploader
          missionId={missionId}
          onMissionFilesChange={handleMissionFilesChange}
          onUploadStateChange={handleProofImageUploadStateChange}
        />
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end gap-3 max-[560px]:flex-col-reverse">
        <button
          className="min-h-12 cursor-pointer rounded-2xl border border-slate-200 bg-white px-7 text-base font-black text-slate-600 transition hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          type="button"
          disabled={isSubmitting}
          onClick={handleCancel}
        >
          취소
        </button>
        <button
          className="min-h-12 cursor-pointer rounded-2xl bg-green-500 px-7 text-base font-black text-white shadow-[0_14px_28px_rgba(34,197,94,0.24)] transition hover:-translate-y-px hover:shadow-[0_18px_32px_rgba(34,197,94,0.28)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          type="submit"
          disabled={isSubmitDisabled}
        >
          {isSubmitting
            ? "제출 중..."
            : isUploadingImage
              ? "이미지 업로드 중..."
              : "제출"}
        </button>
      </div>
    </form>
  );
};

export default MissionProofForm;
