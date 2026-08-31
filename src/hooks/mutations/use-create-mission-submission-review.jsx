import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMissionSubmissionReview } from "../../api/create-mission-submission-review";

// 보고 검토 성공 후 보고 목록과 미션 목록을 다시 가져올 수 있도록 캐시를 무효화합니다.
export function useCreateMissionSubmissionReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMissionSubmissionReview,
    onSuccess: (_data, variables) => {
      if (variables.missionId) {
        queryClient.invalidateQueries({
          queryKey: ["missionSubmissions", String(variables.missionId)],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["missionSubmissions"] });
      }

      if (variables.guildId) {
        queryClient.invalidateQueries({
          queryKey: ["guildMissions", variables.guildId],
        });
        queryClient.invalidateQueries({
          queryKey: ["myGuildMissions", variables.guildId],
        });
      }
    },
  });
}
