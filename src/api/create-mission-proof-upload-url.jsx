import { apiClient } from "../api";

// 의뢰보고 이미지 업로드에 사용할 presigned URL을 발급받습니다.
export const createMissionProofUploadUrl = async ({
  missionId,
  fileName,
}) => {
  const response = await apiClient.post("/missions/presigned-url", {
    missionId: String(missionId),
    fileName,
  });

  return response.data;
};
