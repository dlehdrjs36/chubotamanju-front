import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import guildHallImage from "../assets/guild/guild-hall.png";
import ActiveGameSummary from "../components/home/ActiveGameSummary";
import GameGuildSidebar from "../components/home/GameGuildSidebar";
import MissionList from "../components/home/MissionList";
import MissionSearchInput from "../components/home/MissionSearchInput";
import { useHomeUiStore } from "../store/page/useHomeUiStore";
import { useSessionStore } from "../store/session/useSessionStore";

const Home = () => {
  const [searchParams] = useSearchParams();
  const setSelectedGuildId = useSessionStore(
    (state) => state.setSelectedGuildId,
  );
  const resetHomeUiState = useHomeUiStore((state) => state.resetHomeUiState);
  const guildIdFromUrl = searchParams.get("guildId") ?? searchParams.get("gameId") ?? "";

  // 등록/취소 후 홈으로 돌아온 경우 URL의 guildId를 서비스 세션 선택 길드로 복원합니다.
  useEffect(() => {
    if (guildIdFromUrl) {
      setSelectedGuildId(guildIdFromUrl);
    }
  }, [guildIdFromUrl, setSelectedGuildId]);

  // 검색어 같은 Home 전용 UI 상태는 Home을 벗어나면 버립니다.
  useEffect(() => {
    return () => resetHomeUiState();
  }, [resetHomeUiState]);

  return (
    <section
      className="grid w-full grid-rows-[auto_auto] gap-5"
      aria-label="메인 화면"
    >
      <div className="relative h-[320px] w-full min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.08)] max-[640px]:h-[220px]">
        <img
          className="absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-35 blur-xl"
          src={guildHallImage}
          alt=""
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-white/15" aria-hidden="true" />
        <img
          className="relative h-full w-full object-contain object-center"
          src={guildHallImage}
          alt="길드 홀"
        />
      </div>

      <div className="grid min-h-[560px] min-w-0 grid-cols-[248px_minmax(0,1fr)] overflow-hidden rounded-[28px] border border-slate-400/30 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] max-[920px]:min-h-0 max-[920px]:grid-cols-1">
        <GameGuildSidebar />

        <section
          className="flex min-w-0 flex-col gap-5 p-6 max-[560px]:p-[18px]"
          aria-labelledby="active-guild-title"
        >
          <MissionSearchInput />
          <ActiveGameSummary />
          <MissionList />
        </section>
      </div>
    </section>
  );
};

export default Home;
