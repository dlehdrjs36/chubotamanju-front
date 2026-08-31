import { useQuery } from "@tanstack/react-query";
import { getMissionSubmissions } from "../../api/get-mission-submissions";

// 보고확인 화면에서 선택한 미션의 헌터 보고 목록을 조회합니다.
export function useMissionSubmissionsData(missionId) {
  return useQuery({
    queryFn: ({ signal }) => getMissionSubmissions({ missionId, signal }),
    queryKey: ["missionSubmissions", String(missionId)],
    enabled: Boolean(missionId),
    retry: false,
  });
}
