import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import bountyRequestImage from "../assets/guild/bounty-request.png";
import MissionCreateForm from "../components/MissionCreateForm";
import { useCreateGuildMission } from "../hooks/mutations/use-create-guild-mission";
import { useUserGuildsData } from "../hooks/queries/use-user-guilds-data";
import { useUserProfileData } from "../hooks/queries/use-user-profile-data";

// 폼을 처음 열었을 때 사용할 빈 입력값입니다.
const INITIAL_FORM_VALUES = {
  title: "",
  rewardText: "",
  rewardLimit: "",
  description: "",
};

const MissionCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 로그인 정보는 등록 가능 여부 확인에 사용합니다.
  const { data: userProfile, isLoading: isUserProfileLoading } =
    useUserProfileData();
  const isLoggedIn = Boolean(userProfile?.data);

  // 등록 페이지에서는 로그인 상태일 때만 길드 선택 select를 만들기 위한 길드 목록을 조회합니다.
  const {
    data: fetchedUserGuildsData,
    isLoading: isUserGuildsLoading,
    error: userGuildsError,
  } = useUserGuildsData({ enabled: isLoggedIn });
  const userGuildsData = isLoggedIn ? fetchedUserGuildsData : null;

  // 미션 생성 mutation입니다. 성공 후 홈으로 돌아가면 해당 길드 미션이 다시 조회됩니다.
  const createGuildMissionMutation = useCreateGuildMission();

  const guilds = useMemo(() => {
    // 기존 guild.js 같은 공용 유틸에 기대지 않고, 등록 폼에 필요한 길드 형태만 여기서 맞춥니다.
    const toText = (value) => {
      if (typeof value === "string" || typeof value === "number") {
        return String(value);
      }

      return "";
    };

    // null, undefined, 빈 문자열을 건너뛰고 화면에 표시할 첫 번째 값을 고릅니다.
    const firstPresentValue = (...values) => {
      return values.find(
        (value) => value !== undefined && value !== null && value !== "",
      );
    };

    // get-user-guilds 응답이 ApiResult 또는 배열로 와도 등록 페이지에서 쓸 길드 배열로 꺼냅니다.
    const getGuildList = (guildsResponse) => {
      if (Array.isArray(guildsResponse?.data)) {
        return guildsResponse.data;
      }

      if (Array.isArray(guildsResponse?.data?.guilds)) {
        return guildsResponse.data.guilds;
      }

      if (Array.isArray(guildsResponse?.guilds)) {
        return guildsResponse.guilds;
      }

      if (Array.isArray(guildsResponse)) {
        return guildsResponse;
      }

      return [];
    };

    // select value 비교를 위해 모든 길드 객체가 guildId를 갖도록 이 페이지 안에서 정규화합니다.
    // option 표시명은 guildName으로 통일해서 guildId가 사용자에게 보이지 않게 합니다.
    return getGuildList(userGuildsData)
      .map((guild) => ({
        ...guild,
        guildId: toText(guild?.guildId ?? guild?.guild_id ?? guild?.id),
        guildName:
          toText(
            firstPresentValue(
              guild?.guildName,
              guild?.guild_name,
              guild?.name,
              guild?.displayName,
              guild?.display_name,
              guild?.serverName,
              guild?.server_name,
            ),
          ) || "이름 없는 길드",
      }))
      .filter((guild) => Boolean(guild.guildId));
  }, [userGuildsData]);

  // 홈에서 넘어온 guildId가 있으면 해당 길드를 기본 선택값으로 사용합니다.
  const initialGuildId =
    searchParams.get("guildId") ?? searchParams.get("gameId") ?? "";

  // 현재 폼에서 선택한 길드 id입니다.
  const [selectedGuildId, setSelectedGuildId] = useState(initialGuildId);

  // 사용자가 입력 중인 미션 등록 폼 값입니다.
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);

  // 선택된 길드 id에 해당하는 길드 객체를 찾고, 없으면 첫 번째 길드를 사용합니다.
  const selectedGuild = useMemo(() => {
    return (
      guilds.find((guild) => guild.guildId === selectedGuildId) ?? guilds[0]
    );
  }, [guilds, selectedGuildId]);

  // input/textarea의 name 값을 기준으로 폼 상태를 갱신합니다.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  // 취소 버튼을 누르면 현재 선택된 길드의 미션 목록이 보이는 홈으로 돌아갑니다.
  const handleCancel = () => {
    const guildId = selectedGuild?.guildId ?? selectedGuildId;

    // 홈으로 돌아갈 때 같은 길드가 다시 선택되도록 guildId query를 유지합니다.
    navigate(guildId ? `/?guildId=${encodeURIComponent(guildId)}` : "/");
  };

  // 등록 버튼을 누르면 선택 길드에 미션을 생성한 뒤 해당 길드 홈으로 이동합니다.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLoggedIn || !selectedGuild) {
      return;
    }

    const rewardLimit = Number(formValues.rewardLimit);

    if (!Number.isInteger(rewardLimit) || rewardLimit < 1) {
      return;
    }

    await createGuildMissionMutation.mutateAsync({
      guildId: selectedGuild.guildId,
      guildName: selectedGuild.guildName,
      title: formValues.title.trim(),
      rewardText: formValues.rewardText.trim(),
      rewardLimit,
      description: formValues.description.trim(),
    });

    // 등록 성공 후에도 방금 등록한 길드가 선택된 홈 화면으로 이동합니다.
    navigate(`/?guildId=${encodeURIComponent(selectedGuild.guildId)}`);
  };

  // 로딩/에러/로그인 여부에 따라 폼 영역에 표시할 내용을 결정합니다.
  const renderFormContent = () => {
    if (isUserProfileLoading || (isLoggedIn && isUserGuildsLoading)) {
      return (
        <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-dashed border-slate-300 bg-white/90 text-center text-slate-500">
          <div>
            <strong className="text-[18px] text-slate-700">
              길드 정보를 불러오는 중입니다.
            </strong>
            <p className="mt-2 text-sm font-semibold">잠시만 기다려 주세요.</p>
          </div>
        </div>
      );
    }

    if (userGuildsError) {
      return (
        <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-red-200 bg-red-50 text-center text-red-700">
          <div>
            <strong className="text-[18px] text-red-800">
              등록 폼을 불러오지 못했습니다.
            </strong>
            <p className="mt-2 text-sm font-semibold">
              잠시 후 다시 시도해 주세요.
            </p>
          </div>
        </div>
      );
    }

    if (!isLoggedIn) {
      return (
        <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-dashed border-slate-300 bg-white/90 text-center text-slate-500">
          <div>
            <strong className="text-[18px] text-slate-700">
              로그인이 필요합니다.
            </strong>
            <p className="mt-2 text-sm font-semibold">
              의뢰 등록은 Discord 로그인 후 이용할 수 있습니다.
            </p>
            <button
              className="mt-5 min-h-11 cursor-pointer rounded-2xl bg-[#5865f2] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(88,101,242,0.24)] transition hover:-translate-y-px"
              type="button"
              onClick={() => navigate("/")}
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return (
      <MissionCreateForm
        guilds={guilds}
        selectedGuild={selectedGuild}
        values={formValues}
        isSubmitting={createGuildMissionMutation.isPending}
        errorMessage={createGuildMissionMutation.error?.message}
        onSelectGuild={setSelectedGuildId}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  };

  return (
    <section
      className="grid w-full grid-rows-[auto_auto] gap-5"
      aria-label="의뢰 등록 화면"
    >
      {/* 등록 페이지 상단 비주얼 영역입니다. */}
      <div className="relative h-[320px] w-full min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.08)] max-[640px]:h-[220px]">
        <img
          className="absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-35 blur-xl"
          src={bountyRequestImage}
          alt=""
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-white/15" aria-hidden="true" />
        <img
          className="relative h-full w-full object-contain object-center"
          src={bountyRequestImage}
          alt="의뢰 등록"
        />
      </div>

      {/* 실제 등록 폼 또는 로딩/에러 상태가 들어가는 영역입니다. */}
      <div className="min-w-0">
        {renderFormContent()}
      </div>
    </section>
  );
};

export default MissionCreate;
