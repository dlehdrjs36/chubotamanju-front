const RequestSearchInput = ({ keyword, activeGuildName, onChange }) => {
  return (
    <div className="flex items-center gap-3.5 max-[560px]:flex-col max-[560px]:items-stretch">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">의뢰 검색</span>
        <input
          className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white py-0 pr-[52px] pl-[18px] text-slate-900 shadow-inner outline-none focus:border-[#5865f2] focus:ring-4 focus:ring-[#5865f2]/15"
          type="search"
          value={keyword}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`${activeGuildName ?? "길드"} 의뢰 검색`}
        />
        <span
          className="pointer-events-none absolute top-1/2 right-[18px] -translate-y-1/2 text-[21px] text-slate-400"
          aria-hidden="true"
        >
          ⌕
        </span>
      </label>
    </div>
  );
};

export default RequestSearchInput;
