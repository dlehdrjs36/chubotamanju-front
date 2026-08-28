import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMissionProof } from "../../api/create-mission-proof";

// 의뢰보고 성공 후 미션 목록을 다시 가져올 수 있도록 캐시를 무효화합니다.
export function useCreateMissionProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMissionProof,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guildMissions"] });
    },
  });
}
