import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGuildMission } from "../../api/create-guild-mission";

// 미션 생성 성공 후 해당 길드의 미션 목록 캐시만 무효화합니다.
export function useCreateGuildMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGuildMission,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["guildMissions", variables.guildId],
      });
    },
  });
}
