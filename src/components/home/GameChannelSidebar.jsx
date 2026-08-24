const GameChannelSidebar = ({ games, activeGame, activeChannel, onSelectChannel }) => {
    return (
        <aside className="min-w-0 overflow-y-auto border-r border-slate-200 bg-slate-100 px-4 py-[22px] max-[920px]:overflow-visible max-[920px]:border-b max-[920px]:border-r-0" aria-label="게임 및 채널 목록">
            <p className="mb-4 mt-0 text-[13px] font-black uppercase tracking-[0.12em] text-slate-600 max-[920px]:mb-3">서버</p>

            {games.map((game, index) => {
                const isActiveGame = game.id === activeGame?.id;

                return (
                    <section
                        className={index > 0 ? "mt-[22px] border-t border-slate-400/25 pt-[22px] max-[920px]:mt-4 max-[920px]:pt-4" : ""}
                        key={game.id}
                    >
                        <div
                            className={`flex min-h-11 items-center gap-2.5 rounded-2xl px-2.5 py-2 ${
                                isActiveGame
                                    ? "bg-white text-indigo-950 shadow-[inset_0_0_0_1px_rgba(88,101,242,0.16)]"
                                    : "text-slate-600"
                            }`}
                        >
                            <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-xl bg-gradient-to-br from-[#5865f2] to-violet-600 text-xs font-black tracking-[-0.02em] text-white" aria-hidden="true">
                                {game.icon}
                            </span>
                            <span className="min-w-0 truncate text-[15px] font-black">{game.name}</span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap gap-2 pl-0.5" aria-label={`${game.name} 채널`}>
                            {game.channels.map((channel) => {
                                const isActiveChannel = channel.id === activeChannel?.id;
                                const channelTagClassName = isActiveChannel
                                    ? "inline-flex min-h-8 max-w-full cursor-pointer items-center gap-1 rounded-full border border-[#5865f2] bg-[#5865f2] px-[11px] text-[13px] font-extrabold text-white shadow-[0_10px_18px_rgba(88,101,242,0.22)]"
                                    : "inline-flex min-h-8 max-w-full cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white px-[11px] text-[13px] font-extrabold text-slate-500 transition hover:-translate-y-px hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700";

                                return (
                                    <button
                                        key={channel.id}
                                        type="button"
                                        className={channelTagClassName}
                                        aria-pressed={isActiveChannel}
                                        onClick={() => onSelectChannel(channel.id)}
                                    >
                                        <span aria-hidden="true">#</span>
                                        {channel.name}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </aside>
    );
};

export default GameChannelSidebar;
