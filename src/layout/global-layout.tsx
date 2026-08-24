import Header from "../components/Header";
import Main from "../components/Main";
import Footer from "../components/Footer";
import HomeAdSlot from "../components/home/HomeAdSlot";

export default function GlobalLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7fb] text-slate-900 [background:radial-gradient(circle_at_top_left,rgba(88,101,242,0.08),transparent_32rem),#f6f7fb]">
      <Header />

      <div className="mx-auto grid w-full max-w-[1480px] flex-1 grid-cols-[minmax(92px,150px)_minmax(0,1fr)_minmax(92px,150px)] grid-rows-[auto_auto] gap-5 px-8 pt-7 pb-9 max-[1120px]:grid-cols-1 max-[1120px]:grid-rows-none max-[920px]:px-4 max-[920px]:pt-5 max-[920px]:pb-7">
        <div className="col-start-2 row-start-1 min-w-0 max-[1120px]:col-start-auto max-[1120px]:row-start-auto">
          <Main />
        </div>

        <HomeAdSlot
          className="col-start-1 row-span-2 row-start-1 min-h-[560px] [writing-mode:vertical-rl] max-[1120px]:col-start-auto max-[1120px]:row-span-1 max-[1120px]:row-start-auto max-[1120px]:min-h-[92px] max-[1120px]:[writing-mode:horizontal-tb]"
          label="왼쪽 광고 영역"
        />

        <HomeAdSlot
          className="col-start-3 row-span-2 row-start-1 min-h-[560px] [writing-mode:vertical-rl] max-[1120px]:col-start-auto max-[1120px]:row-span-1 max-[1120px]:row-start-auto max-[1120px]:min-h-[92px] max-[1120px]:[writing-mode:horizontal-tb]"
          label="오른쪽 광고 영역"
        />

        <HomeAdSlot
          className="col-start-2 row-start-2 min-h-[88px] max-[1120px]:col-start-auto max-[1120px]:row-start-auto"
          label="하단 광고 영역"
        />
      </div>

      <Footer />
    </div>
  );
}
