const EMPTY_STATE_CLASS_NAME = "col-span-full grid min-h-[180px] place-items-center content-center gap-1.5 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500";

const HomeEmptyState = ({ title, description, isError = false }) => (
    <div className={`${EMPTY_STATE_CLASS_NAME}${isError ? " border-red-200 bg-red-50 text-red-700" : ""}`}>
        <strong className={isError ? "text-[18px] text-red-800" : "text-[18px] text-slate-700"}>{title}</strong>
        <span>{description}</span>
    </div>
);

export default HomeEmptyState;
