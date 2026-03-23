import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Button, Modal } from "react-bootstrap";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const createImage = (imageSrc) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = imageSrc;
  });

const getCroppedBlob = async (imageSrc, pixelCrop, fileType) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Không thể xử lý ảnh đã chọn.");
  }

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Không thể tạo ảnh sau khi cắt."));
          return;
        }

        resolve(blob);
      },
      fileType,
      0.95,
    );
  });
};

const AvatarUploader = ({
  src,
  alt,
  onUpload,
  onUploaded,
  size = 220,
  className = "",
}) => {
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [error, setError] = useState("");

  const openModal = () => {
    if (!isUploading) {
      setIsModalOpen(true);
    }
  };

  const resetCropState = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  const closeModal = () => {
    if (isUploading) return;
    setIsModalOpen(false);
    resetCropState();
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file) => {
    if (!file) {
      return "Không tìm thấy file ảnh.";
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Chỉ hỗ trợ JPG, PNG hoặc WEBP.";
    }

    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > MAX_FILE_SIZE_MB) {
      return `Kích thước ảnh tối đa ${MAX_FILE_SIZE_MB}MB.`;
    }

    return "";
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    const validationMessage = validateFile(file);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError("");
  };

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleChooseImage = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !previewUrl || !croppedAreaPixels) {
      setError("Vui lòng chọn ảnh trước khi cập nhật.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");

      const croppedBlob = await getCroppedBlob(
        previewUrl,
        croppedAreaPixels,
        selectedFile.type,
      );
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: selectedFile.type,
      });

      const avatarUrl = await onUpload(croppedFile);
      onUploaded?.(avatarUrl);
      closeModal();
    } catch (uploadError) {
      const message =
        uploadError?.response?.data?.message ||
        uploadError?.message ||
        "Upload avatar thất bại. Vui lòng thử lại.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`avatar-uploader ${className}`.trim()}>
      <div
        className="avatar-uploader-frame"
        style={{ width: size, height: size }}
      >
        <img src={src} alt={alt} className="avatar-uploader-image" />
        <button
          type="button"
          className={`avatar-uploader-overlay ${
            isUploading ? "avatar-uploader-overlay-uploading" : ""
          }`}
          onClick={openModal}
          disabled={isUploading}
          aria-label="Cập nhật avatar"
          title="Cập nhật avatar"
        >
          {isUploading ? (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            />
          ) : (
            <span className="material-symbols-outlined" aria-hidden="true">
              photo_camera
            </span>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="avatar-uploader-input"
        onChange={handleFileChange}
      />

      <Modal
        show={isModalOpen}
        onHide={closeModal}
        centered
        className="avatar-crop-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="mx-auto fw-semibold">
            Cập nhật ảnh đại diện
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <Button
              type="button"
              className="avatar-crop-pick-btn"
              onClick={handleChooseImage}
              disabled={isUploading}
            >
              Chọn hình
            </Button>
          </div>

          <div className="avatar-crop-stage mb-3">
            {previewUrl ? (
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            ) : (
              <div className="avatar-crop-empty">
                Chọn ảnh để xem trước và cắt ảnh.
              </div>
            )}
          </div>

          <div className="avatar-crop-zoom mb-3">
            <label htmlFor="avatar-zoom" className="small text-muted">
              Thu phóng
            </label>
            <input
              id="avatar-zoom"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              disabled={!previewUrl || isUploading}
            />
          </div>

          <Button
            type="button"
            className="w-100 avatar-crop-update-btn"
            onClick={handleConfirmUpload}
            disabled={isUploading || !previewUrl}
          >
            {isUploading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </Modal.Body>
      </Modal>

      {error && <div className="avatar-uploader-error">{error}</div>}
    </div>
  );
};

export default AvatarUploader;
