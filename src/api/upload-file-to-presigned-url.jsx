import axios from "axios";

// 서버에서 발급받은 presigned URL로 파일을 직접 업로드합니다.
export const uploadFileToPresignedUrl = async ({
  uploadUrl,
  file,
  method = "PUT",
  contentType,
  onUploadProgress,
}) => {
  const response = await axios.request({
    url: uploadUrl,
    method,
    data: file,
    headers: {
      "Content-Type": contentType || file.type || "application/octet-stream",
    },
    withCredentials: false,
    onUploadProgress,
  });

  return response.data;
};
