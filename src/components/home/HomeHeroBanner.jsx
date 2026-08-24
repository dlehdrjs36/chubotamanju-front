const HomeHeroBanner = ({ imageSrc, alt }) => {
    return (
        <div className="relative h-[320px] w-full min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.08)] max-[640px]:h-[220px]">
            <img className="absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-35 blur-xl" src={imageSrc} alt="" aria-hidden="true" />
            <div className="absolute inset-0 bg-white/15" aria-hidden="true" />
            <img className="relative h-full w-full object-contain object-center" src={imageSrc} alt={alt} />
        </div>
    );
};

export default HomeHeroBanner;
