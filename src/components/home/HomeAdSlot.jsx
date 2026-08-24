const AD_SLOT_CLASS_NAME = "flex items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-white/70 text-2xl font-extrabold uppercase tracking-[0.12em] text-slate-400";

const HomeAdSlot = ({ className = "", label }) => {
    return (
        <aside className={`${AD_SLOT_CLASS_NAME} ${className}`} aria-label={label}>
            <span>AD</span>
        </aside>
    );
};

export default HomeAdSlot;
