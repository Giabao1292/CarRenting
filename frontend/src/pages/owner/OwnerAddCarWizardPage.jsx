import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";
import {
  createOwnerCar,
  getVehicleFeatures,
  uploadOwnerCarImage,
} from "../../services/ownerService";

const STEP_TITLES = ["Thông tin xe", "Cho thuê", "Hình ảnh"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const GOV_LOCATION_API_BASE = "https://provinces.open-api.vn/api";

const initialFormData = {
  licensePlate: "",
  brand: "",
  model: "",
  year: "",
  color: "",
  transmission: "automatic",
  seating: "4",
  pricePerDay: "",
  pricePerHour: "",
  provinceCode: "",
  districtCode: "",
  wardCode: "",
  detailAddress: "",
};

const normalizeText = (value) => String(value || "").trim();

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const OwnerAddCarWizardPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [primaryImageId, setPrimaryImageId] = useState(null);
  const [featureOptions, setFeatureOptions] = useState([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(true);
  const [referenceError, setReferenceError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = useMemo(() => (currentStep / 3) * 100, [currentStep]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    let isCancelled = false;

    const loadReferenceData = async () => {
      setIsLoadingReferenceData(true);
      setReferenceError("");

      try {
        const [featuresResponse, provincesResponse] = await Promise.all([
          getVehicleFeatures(),
          fetch(`${GOV_LOCATION_API_BASE}/p/`).then((response) => {
            if (!response.ok) {
              throw new Error("Không thể tải danh sách tỉnh/thành.");
            }
            return response.json();
          }),
        ]);

        if (isCancelled) {
          return;
        }

        setFeatureOptions(
          featuresResponse.map((feature) => ({
            id: feature.id,
            name: feature.name || "Tiện ích",
            icon: feature.icon || "check_circle",
          })),
        );
        setProvinces(Array.isArray(provincesResponse) ? provincesResponse : []);
      } catch (error) {
        if (!isCancelled) {
          setReferenceError(
            error?.message || "Không thể tải dữ liệu tham chiếu cho form.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingReferenceData(false);
        }
      }
    };

    loadReferenceData();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadDistricts = async () => {
      if (!formData.provinceCode) {
        setDistricts([]);
        setWards([]);
        return;
      }

      try {
        const payload = await fetch(
          `${GOV_LOCATION_API_BASE}/p/${formData.provinceCode}?depth=2`,
        ).then((response) => {
          if (!response.ok) {
            throw new Error("Không thể tải quận/huyện.");
          }
          return response.json();
        });

        if (isCancelled) {
          return;
        }

        setDistricts(
          Array.isArray(payload?.districts) ? payload.districts : [],
        );
      } catch {
        if (!isCancelled) {
          setDistricts([]);
        }
      }
    };

    loadDistricts();

    return () => {
      isCancelled = true;
    };
  }, [formData.provinceCode]);

  useEffect(() => {
    let isCancelled = false;

    const loadWards = async () => {
      if (!formData.districtCode) {
        setWards([]);
        return;
      }

      try {
        const payload = await fetch(
          `${GOV_LOCATION_API_BASE}/d/${formData.districtCode}?depth=2`,
        ).then((response) => {
          if (!response.ok) {
            throw new Error("Không thể tải phuong/xa.");
          }
          return response.json();
        });

        if (isCancelled) {
          return;
        }

        setWards(Array.isArray(payload?.wards) ? payload.wards : []);
      } catch {
        if (!isCancelled) {
          setWards([]);
        }
      }
    };

    loadWards();

    return () => {
      isCancelled = true;
    };
  }, [formData.districtCode]);

  const handleProvinceChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      provinceCode: value,
      districtCode: "",
      wardCode: "",
    }));
    setDistricts([]);
    setWards([]);
    setErrors((prev) => ({
      ...prev,
      provinceCode: "",
      districtCode: "",
      wardCode: "",
    }));
  };

  const handleDistrictChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      districtCode: value,
      wardCode: "",
    }));
    setWards([]);
    setErrors((prev) => ({ ...prev, districtCode: "", wardCode: "" }));
  };

  const handleToggleFeature = (featureId) => {
    setSelectedFeatureIds((prev) => {
      if (prev.includes(featureId)) {
        return prev.filter((id) => id !== featureId);
      }
      return [...prev, featureId];
    });
    setErrors((prev) => ({ ...prev, featureIds: "" }));
  };

  const handleUploadImages = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    setSubmitError("");

    const nextImages = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setSubmitError("Vui lòng chọn đúng định dạng ảnh.");
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setSubmitError("Ảnh không được vượt quá 10MB.");
        continue;
      }

      nextImages.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (!nextImages.length) {
      return;
    }

    setImages((prev) => {
      const merged = [...prev, ...nextImages];
      if (!primaryImageId && merged.length) {
        setPrimaryImageId(merged[0].id);
      }
      return merged;
    });
  };

  const removeImage = (imageId) => {
    setImages((prev) => {
      const target = prev.find((image) => image.id === imageId);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }

      const next = prev.filter((image) => image.id !== imageId);
      if (primaryImageId === imageId) {
        setPrimaryImageId(next[0]?.id || null);
      }
      return next;
    });
  };

  const validateStepOne = () => {
    const nextErrors = {};

    if (!normalizeText(formData.licensePlate)) {
      nextErrors.licensePlate = "Vui lòng nhập biển số xe.";
    }

    if (!normalizeText(formData.brand)) {
      nextErrors.brand = "Vui lòng nhập hãng xe.";
    }

    if (!normalizeText(formData.model)) {
      nextErrors.model = "Vui lòng nhập dòng xe.";
    }

    const year = parseNumber(formData.year);
    if (!year || year < 1990 || year > 2100) {
      nextErrors.year = "Năm sản xuất không hợp lệ.";
    }

    if (!selectedFeatureIds.length) {
      nextErrors.featureIds = "Vui lòng chọn ít nhất 1 tiện ích trên xe.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepTwo = () => {
    const nextErrors = {};

    const perDay = parseNumber(formData.pricePerDay);
    const perHour = parseNumber(formData.pricePerHour);

    if (!perDay || perDay <= 0) {
      nextErrors.pricePerDay = "Giá theo ngày phải lớn hơn 0.";
    }

    if (!perHour || perHour <= 0) {
      nextErrors.pricePerHour = "Giá theo giờ phải lớn hơn 0.";
    }

    if (!normalizeText(formData.provinceCode)) {
      nextErrors.provinceCode = "Vui lòng chọn tỉnh/thành.";
    }

    if (!normalizeText(formData.districtCode)) {
      nextErrors.districtCode = "Vui lòng chọn quận/huyện.";
    }

    if (!normalizeText(formData.wardCode)) {
      nextErrors.wardCode = "Vui lòng chọn phuong/xa.";
    }

    if (!normalizeText(formData.detailAddress)) {
      nextErrors.detailAddress = "Vui lòng nhập số nhà/tên đường cụ thể.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepThree = () => {
    if (!images.length) {
      setSubmitError("Vui lòng thêm ít nhất 1 ảnh xe.");
      return false;
    }

    if (!primaryImageId) {
      setSubmitError("Vui lòng chọn 1 ảnh chính.");
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    setSubmitError("");

    if (currentStep === 1 && !validateStepOne()) {
      return;
    }

    if (currentStep === 2 && !validateStepTwo()) {
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setSubmitError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStepThree()) {
      return;
    }

    const selectedProvince = provinces.find(
      (province) => String(province.code) === String(formData.provinceCode),
    );
    const selectedDistrict = districts.find(
      (district) => String(district.code) === String(formData.districtCode),
    );
    const selectedWard = wards.find(
      (ward) => String(ward.code) === String(formData.wardCode),
    );

    const fullAddress = [
      normalizeText(formData.detailAddress),
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ]
      .filter(Boolean)
      .join(", ");

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const createdVehicle = await createOwnerCar({
        licensePlate: normalizeText(formData.licensePlate),
        brand: normalizeText(formData.brand),
        model: normalizeText(formData.model),
        year: parseNumber(formData.year),
        color: normalizeText(formData.color),
        transmission: normalizeText(formData.transmission) || "automatic",
        seating: parseNumber(formData.seating) || 4,
        pricePerDay: parseNumber(formData.pricePerDay),
        pricePerHour: parseNumber(formData.pricePerHour),
        locationAddress: fullAddress,
        locationCity: selectedProvince?.name || "",
        featureIds: selectedFeatureIds,
      });

      const vehicleId = createdVehicle?.id;
      if (!vehicleId) {
        throw new Error("Không nhận được mã xe sau khi tạo.");
      }

      for (const image of images) {
        await uploadOwnerCarImage(
          vehicleId,
          image.file,
          image.id === primaryImageId,
        );
      }

      setSubmitSuccess(
        "Thêm xe thành công. Xe của bạn đang ở trạng thái PENDING.",
      );
      setTimeout(() => {
        navigate(APP_ROUTES.OWNER_CAR_MANAGE.replace(":id", String(vehicleId)));
      }, 700);
    } catch (error) {
      setSubmitError(error?.message || "Không thể thêm xe mới.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="owner-add-car-page py-4 py-md-5">
      <Container>
        <Card className="owner-add-car-shell border-0 shadow-sm">
          <Card.Body className="p-3 p-md-4 p-xl-5">
            <div className="owner-add-car-header mb-4">
              <p className="owner-add-car-kicker mb-2">OWNER CAR WIZARD</p>
              <h1 className="owner-add-car-title mb-2">Add Another Car</h1>
              <p className="text-muted mb-3">
                Hoàn tất 3 bước để thêm xe mới vào đội xe của bạn.
              </p>
              <ProgressBar now={progress} className="owner-add-car-progress" />
            </div>

            <div className="owner-add-car-stepper mb-4">
              {STEP_TITLES.map((title, index) => {
                const step = index + 1;
                const stateClass =
                  step === currentStep
                    ? "is-active"
                    : step < currentStep
                      ? "is-completed"
                      : "";

                return (
                  <div
                    key={title}
                    className={`owner-add-car-step ${stateClass}`.trim()}
                  >
                    <span className="owner-add-car-step__dot">{step}</span>
                    <p className="owner-add-car-step__title mb-0">{title}</p>
                  </div>
                );
              })}
            </div>

            {submitError ? (
              <Alert variant="warning">{submitError}</Alert>
            ) : null}
            {submitSuccess ? (
              <Alert variant="success">{submitSuccess}</Alert>
            ) : null}
            {referenceError ? (
              <Alert variant="warning">{referenceError}</Alert>
            ) : null}

            {currentStep === 1 ? (
              <section>
                <h5 className="fw-bold mb-3">Thông tin xe</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Biển số xe</Form.Label>
                      <Form.Control
                        value={formData.licensePlate}
                        onChange={handleChange("licensePlate")}
                        isInvalid={Boolean(errors.licensePlate)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.licensePlate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Năm sản xuất</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.year}
                        onChange={handleChange("year")}
                        isInvalid={Boolean(errors.year)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.year}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Hãng xe</Form.Label>
                      <Form.Control
                        value={formData.brand}
                        onChange={handleChange("brand")}
                        isInvalid={Boolean(errors.brand)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.brand}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Dòng xe</Form.Label>
                      <Form.Control
                        value={formData.model}
                        onChange={handleChange("model")}
                        isInvalid={Boolean(errors.model)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.model}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Màu xe</Form.Label>
                      <Form.Control
                        value={formData.color}
                        onChange={handleChange("color")}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Số ghế</Form.Label>
                      <Form.Select
                        value={formData.seating}
                        onChange={handleChange("seating")}
                      >
                        <option value="4">4 ghế</option>
                        <option value="5">5 ghế</option>
                        <option value="7">7 ghế</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Truyền động</Form.Label>
                      <Form.Select
                        value={formData.transmission}
                        onChange={handleChange("transmission")}
                      >
                        <option value="automatic">Số tự động</option>
                        <option value="manual">Số sàn</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <div className="mt-2">
                      <Form.Label className="fw-semibold">
                        Tiện ích trên xe
                      </Form.Label>
                      {isLoadingReferenceData ? (
                        <p className="text-muted small mb-0">
                          Đang tải danh sách tiện ích...
                        </p>
                      ) : (
                        <div className="owner-add-car-feature-grid">
                          {featureOptions.map((feature) => (
                            <button
                              key={feature.id}
                              type="button"
                              className={`owner-add-car-feature-item ${selectedFeatureIds.includes(feature.id) ? "is-selected" : ""}`}
                              onClick={() => handleToggleFeature(feature.id)}
                            >
                              <span className="material-symbols-outlined">
                                {feature.icon || "check_circle"}
                              </span>
                              <span>{feature.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.featureIds ? (
                        <div className="text-danger small mt-2">
                          {errors.featureIds}
                        </div>
                      ) : null}
                    </div>
                  </Col>
                </Row>
              </section>
            ) : null}

            {currentStep === 2 ? (
              <section>
                <h5 className="fw-bold mb-3">Giá và địa chỉ</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Giá mỗi ngày (VND)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.pricePerDay}
                        onChange={handleChange("pricePerDay")}
                        isInvalid={Boolean(errors.pricePerDay)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.pricePerDay}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Giá mỗi giờ (VND)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.pricePerHour}
                        onChange={handleChange("pricePerHour")}
                        isInvalid={Boolean(errors.pricePerHour)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.pricePerHour}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Tỉnh/Thành phố</Form.Label>
                      <Form.Select
                        value={formData.provinceCode}
                        onChange={handleProvinceChange}
                        isInvalid={Boolean(errors.provinceCode)}
                      >
                        <option value="">Chọn tỉnh/thành</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.provinceCode}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Quận/Huyện</Form.Label>
                      <Form.Select
                        value={formData.districtCode}
                        onChange={handleDistrictChange}
                        disabled={!formData.provinceCode}
                        isInvalid={Boolean(errors.districtCode)}
                      >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.districtCode}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phuong/Xa</Form.Label>
                      <Form.Select
                        value={formData.wardCode}
                        onChange={handleChange("wardCode")}
                        disabled={!formData.districtCode}
                        isInvalid={Boolean(errors.wardCode)}
                      >
                        <option value="">Chọn phuong/xa</option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.wardCode}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Số nhà/Tên đường</Form.Label>
                      <Form.Control
                        value={formData.detailAddress}
                        onChange={handleChange("detailAddress")}
                        placeholder="Ví dụ: 123 Nguyen Trai"
                        isInvalid={Boolean(errors.detailAddress)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.detailAddress}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </section>
            ) : null}

            {currentStep === 3 ? (
              <section>
                <h5 className="fw-bold mb-3">Hình ảnh xe</h5>
                <div className="owner-add-car-upload mb-3">
                  <label className="owner-add-car-upload__dropzone">
                    <input
                      type="file"
                      className="d-none"
                      accept="image/*"
                      multiple
                      onChange={handleUploadImages}
                    />
                    <span className="material-symbols-outlined d-block mb-2">
                      add_photo_alternate
                    </span>
                    Chọn nhiều ảnh xe (tối đa 10MB/ảnh)
                  </label>
                </div>

                <Row className="g-3">
                  {images.map((image) => (
                    <Col key={image.id} xs={6} md={4} lg={3}>
                      <div className="owner-add-car-image-card">
                        <img src={image.preview} alt="Ảnh xe" />
                        <div className="owner-add-car-image-card__actions">
                          <Form.Check
                            type="radio"
                            name="primaryImage"
                            id={`primary-image-${image.id}`}
                            label="Ảnh chính"
                            checked={primaryImageId === image.id}
                            onChange={() => setPrimaryImageId(image.id)}
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeImage(image.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </section>
            ) : null}

            <div className="owner-add-car-actions mt-4">
              <Button
                variant="outline-secondary"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                Quay lại
              </Button>

              <div className="d-flex gap-2">
                <Button
                  as={Link}
                  to={APP_ROUTES.OWNER_DASHBOARD}
                  variant="light"
                >
                  Hủy
                </Button>

                {currentStep < 3 ? (
                  <Button
                    variant="success"
                    onClick={handleContinue}
                    disabled={isSubmitting}
                  >
                    Kế tiếp
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang tạo xe..." : "Hoàn tất thêm xe"}
                  </Button>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
};

export default OwnerAddCarWizardPage;
