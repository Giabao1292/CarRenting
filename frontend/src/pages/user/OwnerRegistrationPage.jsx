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
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";
import { getOwnerStatus, registerOwner } from "../../services/ownerService";

const STEP_TITLES = ["Thông tin đăng ký", "Tải ảnh CCCD", "Chờ xét duyệt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const initialFormData = {
  ownerType: "individual",
  residencyType: "permanent",
  fullName: "",
  city: "",
  address: "",
  idNumber: "",
};

const OwnerRegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [idFrontImage, setIdFrontImage] = useState(null);
  const [idBackImage, setIdBackImage] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
  const [fileErrors, setFileErrors] = useState({
    front: "",
    back: "",
  });

  useEffect(() => {
    return () => {
      if (idFrontImage?.preview) {
        URL.revokeObjectURL(idFrontImage.preview);
      }

      if (idBackImage?.preview) {
        URL.revokeObjectURL(idBackImage.preview);
      }
    };
  }, [idBackImage, idFrontImage]);

  useEffect(() => {
    let isMounted = true;

    const syncOwnerStatus = async () => {
      try {
        const status = await getOwnerStatus();

        if (!isMounted) {
          return;
        }

        if (status === "PENDING") {
          setCurrentStep(3);
          setSubmitSuccessMessage(
            "Hồ sơ của bạn đã được gửi trước đó và đang chờ xét duyệt.",
          );
        }
      } catch {
        // Ignore status check failures so new users can continue registration.
      } finally {
        if (isMounted) {
          setIsCheckingStatus(false);
        }
      }
    };

    syncOwnerStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const progressValue = useMemo(() => (currentStep / 3) * 100, [currentStep]);

  const validateStepOne = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ và tên.";
    }

    if (!formData.city.trim()) {
      nextErrors.city = "Vui lòng nhập thành phố thường trú.";
    }

    if (!formData.idNumber.trim()) {
      nextErrors.idNumber = "Vui lòng nhập số CCCD/CMND.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const canContinueFromStepTwo = Boolean(idFrontImage && idBackImage);

  const validateImageFile = (file) => {
    if (!file) {
      return "Tệp ảnh không hợp lệ.";
    }

    if (!file.type.startsWith("image/")) {
      return "Vui lòng chọn đúng định dạng ảnh.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Dung lượng ảnh không được vượt quá 10MB.";
    }

    return "";
  };

  const handleChangeFormField = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event, side) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const fileError = validateImageFile(file);
    if (fileError) {
      setFileErrors((previous) => ({
        ...previous,
        [side]: fileError,
      }));
      event.target.value = "";
      return;
    }

    setFileErrors((previous) => ({
      ...previous,
      [side]: "",
    }));
    setSubmitError("");

    const preview = URL.createObjectURL(file);
    const imagePayload = {
      file,
      preview,
    };

    if (side === "front") {
      if (idFrontImage?.preview) {
        URL.revokeObjectURL(idFrontImage.preview);
      }
      setIdFrontImage(imagePayload);
      return;
    }

    if (idBackImage?.preview) {
      URL.revokeObjectURL(idBackImage.preview);
    }
    setIdBackImage(imagePayload);
  };

  const submitRegistration = async () => {
    if (!idFrontImage?.file || !idBackImage?.file) {
      setSubmitError("Vui lòng tải đủ ảnh mặt trước và mặt sau CCCD.");
      return false;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await registerOwner({
        ownerData: formData,
        idCardFrontFile: idFrontImage.file,
        idCardBackFile: idBackImage.file,
      });

      setSubmitSuccessMessage(
        result.message || "Hồ sơ đã gửi thành công. Vui lòng chờ xét duyệt.",
      );
      setSubmittedAt(new Date());
      return true;
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      const fallbackMessage =
        error?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setSubmitError(serverMessage || fallbackMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    if (currentStep === 1) {
      if (!validateStepOne()) {
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!canContinueFromStepTwo) {
        return;
      }

      const hasRegistered = await submitRegistration();
      if (hasRegistered) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep <= 1) {
      return;
    }

    setCurrentStep((previous) => previous - 1);
  };

  return (
    <main className="owner-onboarding-page py-4 py-md-5">
      <Container>
        <Card className="owner-onboarding-shell border-0 shadow-sm">
          <Card.Body className="p-3 p-md-4 p-xl-5">
            {isCheckingStatus ? (
              <Alert variant="info" className="mb-4">
                Đang kiểm tra trạng thái hồ sơ chủ xe...
              </Alert>
            ) : null}

            <div className="owner-onboarding-header mb-4">
              <p className="owner-onboarding-kicker mb-2">YIOTO OWNER HUB</p>
              <h1 className="owner-onboarding-title mb-2">
                Đăng ký trở thành chủ xe
              </h1>
              <p className="text-muted mb-3">
                Hoàn thành đầy đủ 3 bước để hệ thống xác minh hồ sơ và kích hoạt
                tính năng cho thuê xe của bạn.
              </p>
              <ProgressBar
                now={progressValue}
                className="owner-onboarding-progress"
                aria-label="Tiến độ đăng ký chủ xe"
              />
            </div>

            <div className="owner-onboarding-stepper mb-4">
              {STEP_TITLES.map((title, index) => {
                const stepNumber = index + 1;
                const stateClass =
                  stepNumber === currentStep
                    ? "is-active"
                    : stepNumber < currentStep
                      ? "is-completed"
                      : "";

                return (
                  <div
                    key={title}
                    className={`owner-onboarding-step ${stateClass}`.trim()}
                  >
                    <span className="owner-onboarding-step__dot">
                      {stepNumber}
                    </span>
                    <div>
                      <p className="owner-onboarding-step__title mb-0">
                        {title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {currentStep === 1 ? (
              <section>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Hình thức đăng ký</Form.Label>
                      <Form.Select
                        name="ownerType"
                        value={formData.ownerType}
                        onChange={handleChangeFormField}
                      >
                        <option value="individual">Cá nhân</option>
                        <option value="business">Doanh nghiệp</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Loại cư trú</Form.Label>
                      <Form.Select
                        name="residencyType"
                        value={formData.residencyType}
                        onChange={handleChangeFormField}
                      >
                        <option value="permanent">Thường trú</option>
                        <option value="temporary">Tạm trú</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Họ và tên</Form.Label>
                      <Form.Control
                        name="fullName"
                        placeholder="Nhập họ và tên"
                        value={formData.fullName}
                        onChange={handleChangeFormField}
                        isInvalid={Boolean(formErrors.fullName)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.fullName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Thành phố cư trú</Form.Label>
                      <Form.Control
                        name="city"
                        placeholder="Ví dụ: TP. Hồ Chí Minh"
                        value={formData.city}
                        onChange={handleChangeFormField}
                        isInvalid={Boolean(formErrors.city)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.city}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Địa chỉ hiện tại</Form.Label>
                      <Form.Control
                        name="address"
                        placeholder="Nhập số nhà, đường, phường/xã, quận/huyện"
                        value={formData.address}
                        onChange={handleChangeFormField}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Số CCCD/CMND</Form.Label>
                      <Form.Control
                        name="idNumber"
                        placeholder="12 số"
                        value={formData.idNumber}
                        onChange={handleChangeFormField}
                        isInvalid={Boolean(formErrors.idNumber)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.idNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </section>
            ) : null}

            {currentStep === 2 ? (
              <section>
                <Alert variant="warning" className="mb-3">
                  Ảnh CCCD phải rõ nét, không che mờ thông tin và không bị lóa.
                </Alert>
                {submitError ? (
                  <Alert variant="danger" className="mb-3">
                    {submitError}
                  </Alert>
                ) : null}
                <Row className="g-3">
                  <Col md={6}>
                    <div className="owner-onboarding-upload h-100">
                      <p className="fw-semibold mb-2">Ảnh mặt trước CCCD</p>
                      <label className="owner-onboarding-upload__dropzone">
                        <input
                          type="file"
                          className="d-none"
                          accept="image/*"
                          onChange={(event) =>
                            handleImageChange(event, "front")
                          }
                        />
                        {idFrontImage?.preview ? (
                          <img
                            src={idFrontImage.preview}
                            alt="CCCD mặt trước"
                            className="owner-onboarding-upload__preview"
                          />
                        ) : (
                          <span>
                            <span className="material-symbols-outlined d-block mb-2">
                              add_photo_alternate
                            </span>
                            Chọn ảnh mặt trước
                          </span>
                        )}
                      </label>
                      {fileErrors.front ? (
                        <p className="text-danger small mb-0 mt-2">
                          {fileErrors.front}
                        </p>
                      ) : null}
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="owner-onboarding-upload h-100">
                      <p className="fw-semibold mb-2">Ảnh mặt sau CCCD</p>
                      <label className="owner-onboarding-upload__dropzone">
                        <input
                          type="file"
                          className="d-none"
                          accept="image/*"
                          onChange={(event) => handleImageChange(event, "back")}
                        />
                        {idBackImage?.preview ? (
                          <img
                            src={idBackImage.preview}
                            alt="CCCD mặt sau"
                            className="owner-onboarding-upload__preview"
                          />
                        ) : (
                          <span>
                            <span className="material-symbols-outlined d-block mb-2">
                              photo_camera
                            </span>
                            Chọn ảnh mặt sau
                          </span>
                        )}
                      </label>
                      {fileErrors.back ? (
                        <p className="text-danger small mb-0 mt-2">
                          {fileErrors.back}
                        </p>
                      ) : null}
                    </div>
                  </Col>
                </Row>
              </section>
            ) : null}

            {currentStep === 3 ? (
              <section className="owner-onboarding-result">
                <div
                  className="owner-onboarding-result__icon"
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined">
                    verified_user
                  </span>
                </div>
                <h2 className="h4 fw-bold mb-2">Hồ sơ đã được ghi nhận</h2>
                <p className="text-muted mb-3">
                  Hồ sơ của bạn đang trong trạng thái chờ duyệt. Vui lòng chờ
                  đội ngũ YIOTO xác minh và phản hồi.
                </p>
                {submitSuccessMessage ? (
                  <Alert variant="success" className="mb-3">
                    {submitSuccessMessage}
                  </Alert>
                ) : null}
                {submittedAt ? (
                  <p className="owner-onboarding-result__meta mb-3">
                    Thời gian gửi hồ sơ: {submittedAt.toLocaleString("vi-VN")}
                  </p>
                ) : null}
                <div className="owner-onboarding-result__actions">
                  <Button as={Link} to={APP_ROUTES.HOME} variant="dark">
                    Về trang chủ
                  </Button>
                </div>
              </section>
            ) : null}

            <div className="owner-onboarding-actions mt-4">
              {currentStep < 3 ? (
                <>
                  <Button
                    variant="outline-secondary"
                    onClick={handleBack}
                    disabled={
                      currentStep === 1 || isSubmitting || isCheckingStatus
                    }
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleContinue}
                    disabled={
                      (currentStep === 2 && !canContinueFromStepTwo) ||
                      isSubmitting ||
                      isCheckingStatus
                    }
                  >
                    {currentStep === 2
                      ? isSubmitting
                        ? "Đang gửi hồ sơ..."
                        : "Hoàn tất đăng ký"
                      : "Tiếp tục"}
                  </Button>
                </>
              ) : (
                <Button as={Link} to={APP_ROUTES.HOME} variant="success">
                  Về trang chủ
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
};

export default OwnerRegistrationPage;
