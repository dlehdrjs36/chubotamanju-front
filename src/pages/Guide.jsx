const DISCORD_BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=1474789111117381914&permissions=1099780180992&integration_type=0&scope=bot+applications.commands";

const StepNumber = ({ children }) => (
  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-indigo-600 text-sm font-black text-white">
    {children}
  </span>
);

const GuideStep = ({ number, title, children }) => (
  <li className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
    <StepNumber>{number}</StepNumber>
    <div className="min-w-0">
      <h3 className="mb-2 text-lg font-black text-slate-900">{title}</h3>
      <div className="text-sm leading-6 font-semibold text-slate-600">
        {children}
      </div>
    </div>
  </li>
);

const CommandBadge = ({ children }) => (
  <code className="rounded-lg bg-slate-900 px-2 py-1 text-[13px] font-black text-white">
    {children}
  </code>
);

const Guide = () => {
  return (
    <section className="grid gap-5" aria-label="Chubotamanju 사용 가이드">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] max-[640px]:p-6">
        <p className="mb-2 text-xs font-black tracking-[0.14em] text-indigo-200 uppercase">
          Guide
        </p>
        <h1 className="text-[34px] leading-tight font-black max-[640px]:text-[28px]">
          미션 시스템 시작 가이드
        </h1>
        <p className="mt-3 max-w-[720px] text-base leading-7 font-semibold text-white/75">
          Discord 서버에 미션 봇을 추가하고, 서버 구성원이 미션 시스템에 참여한
          뒤 웹사이트와 봇에서 의뢰를 등록·확인하는 방법입니다.
        </p>
        <a
          className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-[#5865f2] px-6 text-base font-black text-white no-underline shadow-[0_14px_28px_rgba(88,101,242,0.28)] transition hover:-translate-y-px hover:bg-[#4752c4]"
          href={DISCORD_BOT_INVITE_URL}
          target="_blank"
          rel="noreferrer"
        >
          디스코드 봇 초대하기
        </a>
      </div>

      <div className="grid grid-cols-2 gap-5 max-[920px]:grid-cols-1">
        <article className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="mb-1 text-xs font-black tracking-[0.12em] text-indigo-600 uppercase">
            New Server
          </p>
          <h2 className="mb-5 text-2xl font-black text-slate-900">
            서버가 없는 경우
          </h2>
          <ol className="space-y-4">
            <GuideStep number="1" title="Discord 서버 만들기">
              먼저 서버 관리자가 Discord에서 미션 시스템을 사용할 서버를
              생성합니다.
            </GuideStep>
            <GuideStep number="2" title="미션 봇 추가하기">
              봇 초대 링크를 클릭하고, 생성한 서버에 미션 Discord 봇을
              추가합니다.
            </GuideStep>
            <GuideStep number="3" title="봇 역할을 상단으로 이동하기">
              서버 설정의 역할 메뉴로 이동한 뒤, 미션 봇 역할을 미션 등급
              역할보다 상단에 위치시킵니다.
            </GuideStep>
            <GuideStep number="4" title="미션 등급 역할 생성하기">
              서버에서 <CommandBadge>/bounty-rank-role-auto</CommandBadge>
              명령어를 실행해 미션 등급 역할을 자동으로 추가합니다.
            </GuideStep>
            <GuideStep number="5" title="유저 참여하기">
              서버 구성원들은 각자 <CommandBadge>/join</CommandBadge> 명령어를
              사용해 서버의 미션 시스템에 참여합니다.
            </GuideStep>
          </ol>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="mb-1 text-xs font-black tracking-[0.12em] text-emerald-600 uppercase">
            Existing Server
          </p>
          <h2 className="mb-5 text-2xl font-black text-slate-900">
            이미 서버가 있는 경우
          </h2>
          <ol className="space-y-4">
            <GuideStep number="1" title="미션 봇 추가하기">
              봇 초대 링크를 클릭하고, 기존 Discord 서버에 미션 봇을 추가합니다.
            </GuideStep>
            <GuideStep number="2" title="봇 역할을 상단으로 이동하기">
              서버 관리자는 서버 설정의 역할 메뉴에서 미션 봇 역할을 상단에
              위치시킵니다.
            </GuideStep>
            <GuideStep number="3" title="미션 등급 역할 생성하기">
              서버에서 <CommandBadge>/bounty-rank-role-auto</CommandBadge>
              명령어를 실행해 미션 등급 역할을 서버에 추가합니다.
            </GuideStep>
            <GuideStep number="4" title="유저 참여하기">
              서버 구성원들은 각자 <CommandBadge>/join</CommandBadge> 명령어를
              사용해 서버의 미션 시스템에 참여합니다.
            </GuideStep>
          </ol>
        </article>
      </div>

      <article className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <p className="mb-1 text-xs font-black tracking-[0.12em] text-violet-600 uppercase">
          Website Usage
        </p>
        <h2 className="mb-4 text-2xl font-black text-slate-900">
          웹사이트 사용 방법
        </h2>
        <div className="grid grid-cols-3 gap-4 max-[920px]:grid-cols-1">
          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="mb-2 text-lg font-black text-slate-900">
              1. Discord 로그인
            </h3>
            <p className="text-sm leading-6 font-semibold text-slate-600">
              웹사이트 우측 상단의 Discord 로그인 버튼을 눌러 계정을 연결합니다.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="mb-2 text-lg font-black text-slate-900">
              2. 서버 선택
            </h3>
            <p className="text-sm leading-6 font-semibold text-slate-600">
              미션 시스템에 참여한 서버 목록이 화면에 표시됩니다. 서버를
              클릭하면 해당 서버에 등록된 미션을 확인할 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="mb-2 text-lg font-black text-slate-900">
              3. 미션 등록·확인
            </h3>
            <p className="text-sm leading-6 font-semibold text-slate-600">
              미션은 Discord 봇에서도 등록·확인할 수 있고, 웹사이트에서도 의뢰
              등록과 확인이 가능합니다.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
};

export default Guide;
