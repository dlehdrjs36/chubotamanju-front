import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createMissionProofUploadUrl } from "../api/create-mission-proof-upload-url";
import { uploadFileToPresignedUrl } from "../api/upload-file-to-presigned-url";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const noop = () => {};

const getUploadResponseData = (response) => response?.data ?? response ?? {};

const getUploadUrl = (data) => {
  return data.uploadUrl ?? data.presignedUrl ?? data.presigned_url ?? data.url;
};

const getFileKey = (data) => {
  return data.fileKey ?? "";
};

const createUploadItemId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const isImageFile = (file) => {
  return (
    file?.type?.startsWith("image/") ||
    /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(file?.name ?? "")
  );
};

const formatFileSize = (fileSize) => {
  if (fileSize < 1024 * 1024) {
    return `${Math.max(1, Math.round(fileSize / 1024))}KB`;
  }

  return `${(fileSize / 1024 / 1024).toFixed(1)}MB`;
};

const MissionProofImageUploader = ({
  missionId,
  onMissionFilesChange = noop,
  onUploadStateChange = noop,
}) => {
  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef(new Set());
  const [uploadItems, setUploadItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isUploading = useMemo(() => {
    return uploadItems.some((item) => item.status === "uploading");
  }, [uploadItems]);

  const missionFiles = useMemo(() => {
    return uploadItems
      .filter((item) => item.status === "success" && item.fileUrl)
      .map((item) => ({
        originFileName: item.originFileName,
        fileUrl: item.fileUrl,
      }));
  }, [uploadItems]);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      previewUrls.clear();
    };
  }, []);

  useEffect(() => {
    onMissionFilesChange(missionFiles);
  }, [missionFiles, onMissionFilesChange]);

  useEffect(() => {
    onUploadStateChange(isUploading);
  }, [isUploading, onUploadStateChange]);

  const updateUploadItem = useCallback((itemId, updater) => {
    setUploadItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return typeof updater === "function"
          ? updater(item)
          : { ...item, ...updater };
      }),
    );
  }, []);

  const uploadSingleImage = useCallback(
    async (uploadItem) => {
      try {
        const presignedResponse = await createMissionProofUploadUrl({
          missionId,
          fileName: uploadItem.originFileName,
        });
        const presignedData = getUploadResponseData(presignedResponse);
        const uploadUrl = getUploadUrl(presignedData);

        if (!uploadUrl) {
          throw new Error("업로드 URL을 발급받지 못했습니다.");
        }

        const fileKey = getFileKey(presignedData);

        if (!fileKey) {
          throw new Error("업로드 파일 키를 확인하지 못했습니다.");
        }

        await uploadFileToPresignedUrl({
          uploadUrl,
          file: uploadItem.file,
          method: presignedData.method ?? "PUT",
          contentType:
            uploadItem.file.type || "application/octet-stream",
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) {
              return;
            }

            const nextProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );

            updateUploadItem(uploadItem.id, {
              uploadProgress: nextProgress,
            });
          },
        });

        updateUploadItem(uploadItem.id, {
          status: "success",
          uploadProgress: 100,
          fileUrl: fileKey,
        });
      } catch (error) {
        updateUploadItem(uploadItem.id, {
          status: "error",
          errorMessage:
            error?.response?.data?.message ??
            error?.message ??
            "이미지 업로드에 실패했습니다.",
        });
      }
    },
    [missionId, updateUploadItem],
  );

  const uploadImageFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList ?? []);

      if (files.length === 0) {
        return;
      }

      if (!missionId) {
        setErrorMessage("미션 정보를 찾을 수 없어 이미지를 업로드할 수 없습니다.");
        return;
      }

      const nextUploadItems = [];
      const nextErrorMessages = [];

      files.forEach((file) => {
        if (!isImageFile(file)) {
          nextErrorMessages.push(`${file.name}: 이미지 파일만 업로드할 수 있습니다.`);
          return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
          nextErrorMessages.push(`${file.name}: 이미지는 10MB 이하만 업로드할 수 있습니다.`);
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        previewUrlsRef.current.add(previewUrl);

        nextUploadItems.push({
          id: createUploadItemId(),
          file,
          originFileName: file.name,
          previewUrl,
          uploadProgress: 0,
          fileUrl: "",
          status: "uploading",
          errorMessage: "",
        });
      });

      setErrorMessage(nextErrorMessages.join("\n"));

      if (nextUploadItems.length === 0) {
        return;
      }

      setUploadItems((currentItems) => [
        ...currentItems,
        ...nextUploadItems,
      ]);
      nextUploadItems.forEach(uploadSingleImage);
    },
    [missionId, uploadSingleImage],
  );

  const handleFileChange = (event) => {
    uploadImageFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    uploadImageFiles(event.dataTransfer.files);
  };

  const handleDragLeave = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsDragging(false);
  };

  const handleRemoveUploadItem = (itemId) => {
    setUploadItems((currentItems) => {
      const itemToRemove = currentItems.find((item) => item.id === itemId);

      if (itemToRemove?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
        previewUrlsRef.current.delete(itemToRemove.previewUrl);
      }

      return currentItems.filter((item) => item.id !== itemId);
    });
  };

  const handleResetUploadItems = () => {
    uploadItems.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
        previewUrlsRef.current.delete(item.previewUrl);
      }
    });
    setUploadItems([]);
    setErrorMessage("");
  };

  return (
    <div
      className={`rounded-[22px] border-2 border-dashed p-6 text-center transition ${
        isDragging
          ? "border-indigo-500 bg-indigo-100 shadow-[0_18px_40px_rgba(79,70,229,0.16)] ring-4 ring-indigo-200"
          : "border-slate-300 bg-white"
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragging(true);
      }}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-live="polite"
    >
      <input
        className="sr-only"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />

      <button
        className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:-translate-y-px hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        type="button"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadItems.length > 0 ? "이미지 추가 업로드" : "이미지 업로드 버튼"}
      </button>

      <p
        className={`mx-auto mt-4 max-w-[520px] text-sm leading-6 font-semibold transition ${
          isDragging ? "text-indigo-700" : "text-slate-500"
        }`}
      >
        {isDragging
          ? "이미지 파일을 여기에 놓으면 업로드됩니다."
          : "이미지 업로드 버튼을 클릭하여 이미지 파일을 업로드 하거나 여러 이미지 파일을 드래그 하여 해당 영역에 옮겨주세요."}
      </p>

      {uploadItems.length > 0 ? (
        <div className="mt-5 space-y-3 text-left">
          <div className="flex items-center justify-between gap-3 max-[560px]:flex-col max-[560px]:items-stretch">
            <p className="text-sm font-black text-slate-700">
              선택한 이미지 {uploadItems.length}개
            </p>
            <button
              className="cursor-pointer border-0 bg-transparent text-sm font-black text-red-500 underline decoration-red-200 underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isUploading}
              onClick={handleResetUploadItems}
            >
              전체 삭제
            </button>
          </div>

          <div className="grid gap-3">
            {uploadItems.map((item) => (
              <div
                className="rounded-2xl bg-slate-50 p-4"
                key={item.id}
              >
                <div className="flex items-start gap-4 max-[560px]:flex-col">
                  <img
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200 max-[560px]:h-40 max-[560px]:w-full"
                    src={item.previewUrl}
                    alt={`${item.originFileName} 미리보기`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-700">
                          {item.originFileName}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>

                      <button
                        className="shrink-0 cursor-pointer border-0 bg-transparent text-sm font-black text-red-500 underline decoration-red-200 underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        disabled={item.status === "uploading"}
                        onClick={() => handleRemoveUploadItem(item.id)}
                      >
                        삭제
                      </button>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-[width] ${
                          item.status === "error"
                            ? "bg-red-500"
                            : item.status === "success"
                              ? "bg-green-500"
                              : "bg-indigo-600"
                        }`}
                        style={{ width: `${item.uploadProgress}%` }}
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={item.uploadProgress}
                        aria-label={`${item.originFileName} 업로드 진행률`}
                      />
                    </div>

                    <p
                      className={`mt-2 text-sm font-bold ${
                        item.status === "error"
                          ? "text-red-600"
                          : item.status === "success"
                            ? "text-green-600"
                            : "text-slate-500"
                      }`}
                    >
                      {item.status === "uploading"
                        ? `업로드 중 ${item.uploadProgress}%`
                        : item.status === "success"
                          ? "업로드 완료"
                          : item.errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 whitespace-pre-line rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};

export default MissionProofImageUploader;
