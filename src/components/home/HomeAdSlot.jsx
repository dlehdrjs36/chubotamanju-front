const AD_SLOT_CLASS_NAME =
  "invisible pointer-events-none flex select-none items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-white/70 text-2xl font-extrabold tracking-[0.12em] text-slate-400 uppercase";

const HomeAdSlot = ({ className = "" }) => {
  return (
    <aside className={`${AD_SLOT_CLASS_NAME} ${className}`} aria-hidden="true">
      <span>AD</span>
    </aside>
  );
};

export default HomeAdSlot;
