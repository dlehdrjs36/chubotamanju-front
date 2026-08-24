// input 공통 Tailwind 클래스입니다.
const INPUT_CLASS_NAME =
  "min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 shadow-inner outline-none transition focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/15";

// textarea는 input 기본 스타일에 높이와 padding만 추가합니다.
const TEXTAREA_CLASS_NAME = `${INPUT_CLASS_NAME} min-h-[140px] resize-y py-3`;

// label과 입력 필드를 같은 2열 레이아웃으로 맞추기 위한 공통 클래스입니다.
const FORM_ROW_CLASS_NAME =
  "grid grid-cols-[120px_minmax(0,1fr)] items-start gap-4 max-[640px]:grid-cols-1 max-[640px]:gap-2";

const RequestCreateForm = ({
  guilds,
  selectedGuild,
  values,
  isSubmitting,
  errorMessage,
  onSelectGuild,
  onChange,
  onSubmit,
  onCancel,
}) => {
  // 제출 중이거나 선택된 길드가 없으면 등록 버튼을 비활성화합니다.
  const isSubmitDisabled = isSubmitting || !selectedGuild;

  // guild 표시 유틸 파일을 따로 두지 않고, select option에는 guildName만 보여줍니다.
  const getGuildDisplayName = (guild) => {
    const displayName =
      guild?.guildName ??
      guild?.guild_name ??
      guild?.name ??
      guild?.displayName ??
      guild?.display_name ??
      guild?.serverName ??
      guild?.server_name;

    if (displayName) {
      return displayName;
    }

    return "이름 없는 길드";
  };

  return (
    <form
      className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] max-[640px]:p-5"
      onSubmit={onSubmit}
    >
      {/* 폼 제목과 설명 영역입니다. */}
      <div className="mb-6">
        <p className="mb-1 text-xs font-black tracking-[0.12em] text-indigo-600 uppercase">
          Request
        </p>
        <h1 className="text-[28px] leading-tight font-black text-slate-900">
          길드 미션 등록
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          선택한 Discord 길드에 새 의뢰를 등록합니다.
        </p>
      </div>

      {/* 미션 생성에 필요한 입력 필드 묶음입니다. */}
      <div className="space-y-4">
        <label className={FORM_ROW_CLASS_NAME}>
          <span className="pt-3 text-sm font-black text-slate-600">길드</span>
          <select
            className={INPUT_CLASS_NAME}
            value={selectedGuild?.guildId ?? ""}
            onChange={(event) => onSelectGuild(event.target.value)}
            required
          >
            {guilds.map((guild) => (
              <option key={guild.guildId} value={guild.guildId}>
                {getGuildDisplayName(guild)}
              </option>
            ))}
          </select>
        </label>

        <label className={FORM_ROW_CLASS_NAME}>
          <span className="pt-3 text-sm font-black text-slate-600">미션명</span>
          <input
            className={INPUT_CLASS_NAME}
            name="title"
            value={values.title}
            onChange={onChange}
            placeholder="의뢰명을 입력해 주세요"
            required
          />
        </label>

        <label className={FORM_ROW_CLASS_NAME}>
          <span className="pt-3 text-sm font-black text-slate-600">보상</span>
          <input
            className={INPUT_CLASS_NAME}
            name="rewardText"
            value={values.rewardText}
            onChange={onChange}
            placeholder="예: 골드 10,000"
            required
          />
        </label>

        <label className={FORM_ROW_CLASS_NAME}>
          <span className="pt-3 text-sm font-black text-slate-600">
            보수횟수
          </span>
          <input
            className={INPUT_CLASS_NAME}
            name="rewardLimit"
            type="number"
            min="1"
            step="1"
            value={values.rewardLimit}
            onChange={onChange}
            placeholder="예: 1"
            required
          />
        </label>

        <label className={FORM_ROW_CLASS_NAME}>
          <span className="pt-3 text-sm font-black text-slate-600">
            의뢰 내용
          </span>
          <textarea
            className={TEXTAREA_CLASS_NAME}
            name="description"
            value={values.description}
            onChange={onChange}
            placeholder="의뢰 설명을 자세히 입력해 주세요"
            required
          />
        </label>
      </div>

      {/* mutation에서 전달된 서버 에러 메시지를 폼 하단에 표시합니다. */}
      {errorMessage ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {/* 취소는 홈으로 이동하고, 등록은 form submit으로 처리합니다. */}
      <div className="mt-6 flex justify-end gap-3 max-[560px]:flex-col-reverse">
        <button
          className="min-h-12 cursor-pointer rounded-2xl border border-slate-200 bg-white px-7 text-base font-black text-slate-600 transition hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          취소
        </button>
        <button
          className="min-h-12 cursor-pointer rounded-2xl bg-green-500 px-7 text-base font-black text-white shadow-[0_14px_28px_rgba(34,197,94,0.24)] transition hover:-translate-y-px hover:shadow-[0_18px_32px_rgba(34,197,94,0.28)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          type="submit"
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
};

export default RequestCreateForm;
