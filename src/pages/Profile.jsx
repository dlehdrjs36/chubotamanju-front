import { useUserProfileData } from "../hooks/queries/use-user-profile-data";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

const getProfileDisplayName = (profile) => {
  return (
    profile?.providerGlobalName ??
    profile?.globalName ??
    profile?.username ??
    profile?.name ??
    "계정"
  );
};

const Profile = () => {
  const { data: userProfile, isLoading } = useUserProfileData();
  const profile = userProfile?.data;
  const discordLoginUrl = `${API_BASE_URL}/oauth2/authorization/discord`;

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white/95 p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <strong className="text-[18px] text-slate-700">
          프로필을 불러오는 중입니다.
        </strong>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/95 p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <strong className="text-[18px] text-slate-700">
          로그인이 필요합니다.
        </strong>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          프로필은 Discord 로그인 후 확인할 수 있습니다.
        </p>
        <a
          className="mt-5 inline-flex min-h-11 items-center rounded-2xl bg-[#5865f2] px-5 text-sm font-black text-white no-underline shadow-[0_12px_24px_rgba(88,101,242,0.24)] transition hover:-translate-y-px"
          href={discordLoginUrl}
        >
          Discord 로그인
        </a>
      </section>
    );
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
      aria-label="프로필 화면"
    >
      <p className="mb-1 text-xs font-black tracking-[0.12em] text-indigo-600 uppercase">
        Profile
      </p>
      <h1 className="text-[28px] leading-tight font-black text-slate-900">
        {getProfileDisplayName(profile)}
      </h1>
      <dl className="mt-6 grid gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="mb-1 font-black text-slate-400">Provider</dt>
          <dd className="m-0 font-bold text-slate-700">
            {profile.provider ?? "Discord"}
          </dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="mb-1 font-black text-slate-400">Discord ID</dt>
          <dd className="m-0 font-bold text-slate-700">
            {profile.providerId ?? profile.providerUserId ?? profile.id ?? "-"}
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default Profile;
