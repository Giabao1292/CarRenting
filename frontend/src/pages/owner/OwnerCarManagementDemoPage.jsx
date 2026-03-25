import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";
import {
  deleteOwnerCarImage,
  getOwnerCarManageDetail,
  updateOwnerCarManageDetail,
  uploadOwnerCarImage,
} from "../../services/ownerService";

const normalizeText = (value) => String(value || "").trim();

const normalizeStatus = (value) =>
  String(value || "pending")
    .trim()
    .toLowerCase();

const statusLabelMap = {
  available: "AVAILABLE",
  pending: "PENDING",
  rejected: "REJECTED",
  inactive: "INACTIVE",
  rented: "RENTED",
};

const statusClassMap = {
  available: "chip-available",
  pending: "chip-pending",
  rejected: "chip-rejected",
  inactive: "chip-inactive",
  rented: "chip-rented",
};

const parseDecimal = (value) => {
  const normalized = String(value || "")
    .replace(/,/g, ".")
    .trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const OwnerCarManagementDemoPage = () => {
  const { id } = useParams();
  const vehicleId = String(id || "").trim();
  const fileInputRef = useRef(null);

  const [carDetail, setCarDetail] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingImageId, setIsDeletingImageId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formValues, setFormValues] = useState({
    brand: "",
    model: "",
    year: "",
    licensePlate: "",
    color: "",
    transmission: "",
    pricePerDay: "",
    pricePerHour: "",
  });

  useEffect(() => {
    let isCancelled = false;

    const loadDetail = async () => {
      if (!vehicleId) {
        setErrorMessage("Thiếu mã xe để quản lý.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const detail = await getOwnerCarManageDetail(vehicleId);

        if (isCancelled) {
          return;
        }

        setCarDetail(detail);
        setFormValues({
          brand: normalizeText(detail?.brand),
          model: normalizeText(detail?.model),
          year: detail?.year ? String(detail.year) : "",
          licensePlate: normalizeText(detail?.licensePlate),
          color: normalizeText(detail?.color),
          transmission: normalizeText(detail?.transmission),
          pricePerDay:
            detail?.pricePerDay !== null && detail?.pricePerDay !== undefined
              ? String(detail.pricePerDay)
              : "",
          pricePerHour:
            detail?.pricePerHour !== null && detail?.pricePerHour !== undefined
              ? String(detail.pricePerHour)
              : "",
        });

        const firstImageId = detail?.images?.[0]?.id || null;
        setSelectedImageId(firstImageId);
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error?.message || "Không thể tải thông tin xe.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      isCancelled = true;
    };
  }, [vehicleId]);

  const images = useMemo(() => {
    const source = Array.isArray(carDetail?.images) ? carDetail.images : [];
    return [...source].sort(
      (a, b) => Number(b?.isPrimary) - Number(a?.isPrimary),
    );
  }, [carDetail?.images]);

  const selectedImage = useMemo(() => {
    if (!images.length) {
      return null;
    }

    return images.find((image) => image.id === selectedImageId) || images[0];
  }, [images, selectedImageId]);

  const normalizedStatus = normalizeStatus(carDetail?.status);
  const statusLabel = statusLabelMap[normalizedStatus] || "PENDING";
  const statusClass = statusClassMap[normalizedStatus] || "chip-pending";

  const handleChangeField = (field) => (event) => {
    const nextValue = event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSaveChanges = async () => {
    if (!vehicleId) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await updateOwnerCarManageDetail(vehicleId, {
        brand: normalizeText(formValues.brand),
        model: normalizeText(formValues.model),
        year: formValues.year ? Number(formValues.year) : null,
        licensePlate: normalizeText(formValues.licensePlate),
        color: normalizeText(formValues.color),
        transmission: normalizeText(formValues.transmission),
        pricePerDay: parseDecimal(formValues.pricePerDay),
        pricePerHour: parseDecimal(formValues.pricePerHour),
      });

      setCarDetail(updated);
      setSuccessMessage(
        "Đã cập nhật xe thành công. Trạng thái xe được chuyển về PENDING.",
      );
    } catch (error) {
      setErrorMessage(error?.message || "Không thể lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !vehicleId) {
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await uploadOwnerCarImage(
        vehicleId,
        file,
        images.length === 0,
      );
      setCarDetail(updated);
      const firstId = updated?.images?.[0]?.id || null;
      setSelectedImageId(firstId);
      setSuccessMessage("Tải ảnh xe thành công.");
    } catch (error) {
      setErrorMessage(error?.message || "Không thể tải ảnh xe.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!vehicleId || !imageId) {
      return;
    }

    setIsDeletingImageId(imageId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await deleteOwnerCarImage(vehicleId, imageId);
      setCarDetail(updated);

      if (selectedImageId === imageId) {
        const nextId = updated?.images?.[0]?.id || null;
        setSelectedImageId(nextId);
      }

      setSuccessMessage("Đã xóa ảnh xe thành công.");
    } catch (error) {
      setErrorMessage(error?.message || "Không thể xóa ảnh xe.");
    } finally {
      setIsDeletingImageId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="py-4 text-center">
        <Spinner animation="border" role="status" />
      </section>
    );
  }

  return (
    <section className="owner-car-manage-demo d-grid gap-4">
      <Card className="border-0 shadow-sm rounded-4 owner-car-manage-hero">
        <Card.Body className="p-4 p-lg-5 d-flex flex-column flex-lg-row justify-content-between gap-3">
          <div>
            <div className="text-uppercase small fw-semibold owner-car-manage-eyebrow mb-2">
              Trang demo
            </div>
            <h2 className="fw-bold mb-2">Quản lý xe chi tiết</h2>
            <p className="text-muted mb-0">
              Quản lý xe #{vehicleId || "--"}. Khi bạn thay đổi thuộc tính, xe
              sẽ tự về trạng thái chờ duyệt.
            </p>
          </div>

          <div className="d-flex align-items-start gap-2">
            <Badge className={`px-3 py-2 owner-car-manage-chip ${statusClass}`}>
              {statusLabel}
            </Badge>
            <Button
              as={Link}
              to={APP_ROUTES.OWNER_DASHBOARD}
              variant="outline-secondary"
            >
              Quay lại dashboard
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4 p-lg-5 d-grid gap-4">
              {errorMessage ? (
                <Alert variant="warning" className="mb-0">
                  {errorMessage}
                </Alert>
              ) : null}
              {successMessage ? (
                <Alert variant="success" className="mb-0">
                  {successMessage}
                </Alert>
              ) : null}

              <div>
                <h5 className="fw-bold mb-3">Thông tin cơ bản</h5>
                <Row className="g-3">
                  <Col md={8}>
                    <Form.Label>Tên hiển thị xe</Form.Label>
                    <Form.Control
                      value={`${normalizeText(formValues.brand)} ${normalizeText(formValues.model)}`.trim()}
                      readOnly
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Biển số</Form.Label>
                    <Form.Control
                      value={formValues.licensePlate}
                      onChange={handleChangeField("licensePlate")}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Hãng xe</Form.Label>
                    <Form.Control
                      value={formValues.brand}
                      onChange={handleChangeField("brand")}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Dòng xe</Form.Label>
                    <Form.Control
                      value={formValues.model}
                      onChange={handleChangeField("model")}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Năm sản xuất</Form.Label>
                    <Form.Control
                      type="number"
                      value={formValues.year}
                      onChange={handleChangeField("year")}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Màu xe</Form.Label>
                    <Form.Control
                      value={formValues.color}
                      onChange={handleChangeField("color")}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Hộp số</Form.Label>
                    <Form.Control
                      value={formValues.transmission}
                      onChange={handleChangeField("transmission")}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Giá theo ngày</Form.Label>
                    <Form.Control
                      value={formValues.pricePerDay}
                      onChange={handleChangeField("pricePerDay")}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Giá theo giờ</Form.Label>
                    <Form.Control
                      value={formValues.pricePerHour}
                      onChange={handleChangeField("pricePerHour")}
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label>Địa chỉ nhận xe</Form.Label>
                    <Form.Control
                      value={
                        normalizeText(carDetail?.locationAddress) ||
                        "Chưa cập nhật"
                      }
                      readOnly
                    />
                  </Col>
                </Row>
              </div>

              <div>
                <h5 className="fw-bold mb-3">Thư viện ảnh</h5>
                <div className="owner-car-manage-gallery">
                  <div className="owner-car-manage-gallery-main">
                    {selectedImage?.imageUrl ? (
                      <img src={selectedImage.imageUrl} alt="Xe đang chọn" />
                    ) : (
                      <div className="owner-car-manage-main-empty">
                        <span className="material-symbols-outlined">
                          directions_car
                        </span>
                        Chưa có ảnh xe
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleUploadImage}
                  />

                  <div className="owner-car-manage-gallery-subgrid">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className={`owner-car-manage-thumb ${selectedImage?.id === image.id ? "is-active" : ""}`}
                      >
                        <button
                          type="button"
                          className="owner-car-manage-remove-btn"
                          onClick={() => handleDeleteImage(image.id)}
                          disabled={isDeletingImageId === image.id}
                        >
                          x
                        </button>
                        <button
                          type="button"
                          className="owner-car-manage-thumb-select"
                          onClick={() => setSelectedImageId(image.id)}
                        >
                          <img
                            src={image.imageUrl}
                            alt={`Ảnh xe ${image.id}`}
                          />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="owner-car-manage-upload-tile"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <span className="material-symbols-outlined">
                        add_photo_alternate
                      </span>
                      {isUploading ? "Đang tải..." : "Thêm ảnh"}
                    </button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <div className="d-grid gap-4">
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">Trạng thái duyệt</h6>
                <div className="d-grid gap-2">
                  <div className="owner-car-manage-chip chip-pending">
                    {statusLabel}
                  </div>
                  <small className="text-muted">
                    {normalizeText(carDetail?.rejectionReason)
                      ? `Lý do từ chối: ${carDetail.rejectionReason}`
                      : "Cập nhật thông tin hoặc ảnh sẽ đưa xe về trạng thái PENDING."}
                  </small>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">Tác vụ nhanh</h6>
                <div className="d-grid gap-2">
                  <Button
                    variant="success"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <Button
                    as={Link}
                    to={APP_ROUTES.CAR_DETAILS.replace(":id", vehicleId || "")}
                    variant="outline-primary"
                  >
                    Xem trước trang xe
                  </Button>
                  <Button variant="outline-danger" disabled>
                    Tạm ngưng xe
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">Checklist hồ sơ</h6>
                <ul className="owner-car-manage-checklist mb-0">
                  <li>Đã có tối thiểu 4 ảnh xe</li>
                  <li>Đã nhập biển số và giấy tờ</li>
                  <li>Đã thiết lập giá theo ngày/giờ</li>
                  <li>Đã chọn địa điểm nhận xe</li>
                </ul>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </section>
  );
};

export default OwnerCarManagementDemoPage;
