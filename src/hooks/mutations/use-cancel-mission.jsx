import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelMission } from "../../api/cancel-mission";

// 미션 취소 성공 후 전체/내 등록 미션 목록을 다시 가져올 수 있도록 캐시를 무효화합니다.
export function useCancelMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMission,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["guildMissions", variables.guildId],
      });
      queryClient.invalidateQueries({
        queryKey: ["myGuildMissions", variables.guildId],
      });
    },
  });
}
