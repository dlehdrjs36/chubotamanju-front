import { apiClient } from "../api";

// 선택한 헌터 보고에 대한 의뢰자의 검토 결과를 생성합니다.
export const createMissionSubmissionReview = async ({
  submissionId,
  guildId,
  note,
  approve,
}) => {
  const response = await apiClient.post(
    `/submissions/${encodeURIComponent(submissionId)}/review`,
    {
      guildId,
      note,
      approve,
    },
  );

  return response.data;
};
