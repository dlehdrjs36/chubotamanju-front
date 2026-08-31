import { useNavigate } from "react-router-dom";
import bountyBoardImage from "../assets/guild/bounty-board.png";
import MissionReportReviewBoard from "../components/MissionReportReviewBoard";
import { useMissionReportReviewTarget } from "../hooks/use-mission-report-review-target";

const MissionReportReview = () => {
  const navigate = useNavigate();
  const { mission, cancelPath, guild } = useMissionReportReviewTarget();

  if (!mission) {
    return (
      <section className="w-full" aria-label="보고확인 화면">
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/95 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <strong className="text-[20px] text-slate-800">
            보고를 확인할 미션 정보를 찾을 수 없습니다.
          </strong>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            내가 등록한 미션 목록에서 다시 선택해 주세요.
          </p>
          <button
            className="mt-6 min-h-11 cursor-pointer rounded-2xl bg-[#5865f2] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(88,101,242,0.24)] transition hover:-translate-y-px"
            type="button"
            onClick={() => navigate("/missions/me")}
          >
            내가 등록한 미션으로 이동
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="grid w-full grid-rows-[auto_auto] gap-5"
      aria-label="보고확인 화면"
    >
      <div className="relative h-[320px] w-full min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.08)] max-[640px]:h-[220px]">
        <img
          className="absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-35 blur-xl"
          src={bountyBoardImage}
          alt=""
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-white/15" aria-hidden="true" />
        <img
          className="relative h-full w-full object-contain object-center"
          src={bountyBoardImage}
          alt="보고확인 게시판"
        />
      </div>

      <MissionReportReviewBoard
        mission={mission}
        guild={guild}
        onBack={() => navigate(cancelPath)}
      />
    </section>
  );
};

export default MissionReportReview;
