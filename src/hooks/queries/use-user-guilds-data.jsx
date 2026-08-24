import { useQuery } from "@tanstack/react-query";
import { getUserGuilds } from "../../api/get-user-guilds";

// 홈 진입 시 사이드바에 보여줄 길드 목록을 조회합니다.
export function useUserGuildsData({ enabled = true } = {}) {
  return useQuery({
    queryFn: getUserGuilds,
    queryKey: ["userGuilds"],
    enabled,
    retry: false,
  });
}
