import { Badge, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import AppButton from "../../components/common/AppButton";
import AppInputField from "../../components/common/AppInputField";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import ProfileProgressCard from "../../components/user/profile-verification/ProfileProgressCard";
import UploadPlaceholder from "../../components/user/profile-verification/UploadPlaceholder";
import VerificationTipsCard from "../../components/user/profile-verification/VerificationTipsCard";
import useProfileVerificationForm from "../../hooks/useProfileVerificationForm";
import { getProfileVerificationInitialData } from "../../services/profile/profileVerificationService";

const ProfileVerificationPage = () => {
  const navigate = useNavigate();
  const initialData = useMemo(() => getProfileVerificationInitialData(), []);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmVariant: "primary",
    action: null,
  });
  const [actionMessage, setActionMessage] = useState("");
  const { values, errors, setFieldValue, validateAll } =
    useProfileVerificationForm(initialData.personalInfo);

  const openActionModal = ({
    title,
    message,
    confirmText,
    confirmVariant,
    action,
  }) => {
    setModalConfig({
      show: true,
      title,
      message,
      confirmText,
      confirmVariant,
      action,
    });
  };

  const closeActionModal = () => {
    setModalConfig((prev) => ({ ...prev, show: false, action: null }));
  };

  const handleContinueClick = () => {
    const isFormValid = validateAll();

    if (!isFormValid) {
      setActionMessage("Please review highlighted fields before continuing.");
      return;
    }

    openActionModal({
      title: "Submit Verification",
      message: "Your verification data will be submitted for review.",
      confirmText: "Submit",
      confirmVariant: "success",
      action: "continue",
    });
  };

  const handleConfirmAction = () => {
    if (modalConfig.action === "save") {
      setActionMessage("Draft saved successfully.");
    }

    if (modalConfig.action === "remove") {
      setActionMessage("Uploaded image removed.");
    }

    if (modalConfig.action === "cancel") {
      navigate(-1);
      return;
    }

    if (modalConfig.action === "continue") {
      setActionMessage("Verification submitted successfully.");
    }

    closeActionModal();
  };

  return (
    <section className="bg-light-subtle py-4">
      <Container className="py-4 py-lg-5">
        <div className="d-grid gap-4">
          <ProfileProgressCard
            completion={initialData.completion}
            stepText={initialData.stepText}
          />

          {actionMessage && (
            <div
              className="alert alert-success border-0 shadow-sm mb-0"
              role="status"
            >
              {actionMessage}
            </div>
          )}

          <Row className="g-4">
            <Col lg={8}>
              <div className="d-grid gap-4">
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4 p-md-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-success">
                        person
                      </span>
                      <h5 className="fw-bold mb-0">Personal Information</h5>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <AppInputField
                          id="fullName"
                          label="Full Name"
                          placeholder="e.g. Alex Johnson"
                          value={values.fullName ?? ""}
                          onChange={(event) =>
                            setFieldValue("fullName", event.target.value)
                          }
                          error={errors.fullName}
                        />
                      </Col>
                      <Col md={6}>
                        <AppInputField
                          id="dob"
                          label="Date of Birth"
                          placeholder="YYYY-MM-DD"
                          value={values.dob ?? ""}
                          onChange={(event) =>
                            setFieldValue("dob", event.target.value)
                          }
                          error={errors.dob}
                        />
                      </Col>
                      <Col md={6}>
                        <AppInputField
                          id="phone"
                          label="Phone Number"
                          placeholder="+1 (555) 000-0000"
                          value={values.phone ?? ""}
                          onChange={(event) =>
                            setFieldValue("phone", event.target.value)
                          }
                          helperText="Use an active phone number for verification updates."
                          error={errors.phone}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="small fw-semibold">
                          Nationality
                        </Form.Label>
                        <Form.Select
                          value={values.nationality ?? ""}
                          onChange={(event) =>
                            setFieldValue("nationality", event.target.value)
                          }
                          isInvalid={Boolean(errors.nationality)}
                        >
                          <option value="">Select nationality</option>
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                          <option>Australia</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.nationality}
                        </Form.Control.Feedback>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4 p-md-5">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-success">
                        badge
                      </span>
                      <h5 className="fw-bold mb-0">Document Upload</h5>
                    </div>
                    <p className="text-muted small mb-4">
                      Please upload a clear photo of your ID card and Driver's
                      License. Both sides are required.
                    </p>
                    <div className="alert alert-light border rounded-3 small mb-4">
                      Accepted files: JPG, PNG • Max size: 5MB per image
                    </div>

                    <div className="d-grid gap-4">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <strong>1. Identity Card (CCCD)</strong>
                          <span className="material-symbols-outlined text-success">
                            check_circle
                          </span>
                        </div>
                        <Row className="g-3">
                          <Col md={6}>
                            <UploadPlaceholder label="Upload Front Side" />
                          </Col>
                          <Col md={6}>
                            <UploadPlaceholder label="Upload Back Side" />
                          </Col>
                        </Row>
                      </div>

                      <div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <strong>2. Driver's License</strong>
                          <Badge bg="light" text="dark">
                            Required for Renters
                          </Badge>
                        </div>
                        <Row className="g-3">
                          <Col md={6}>
                            <div className="profile-upload-preview">
                              <img
                                src={initialData.uploadedLicenseFront}
                                alt="Uploaded license"
                              />
                              <AppButton
                                variant="light"
                                className="btn-sm fw-bold"
                                onClick={() =>
                                  openActionModal({
                                    title: "Remove Uploaded Image",
                                    message:
                                      "Do you want to remove this uploaded image?",
                                    confirmText: "Remove",
                                    confirmVariant: "danger",
                                    action: "remove",
                                  })
                                }
                              >
                                Remove
                              </AppButton>
                            </div>
                          </Col>
                          <Col md={6}>
                            <UploadPlaceholder label="Upload Back Side" />
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <div className="d-flex flex-column flex-sm-row justify-content-between gap-3">
                  <AppButton
                    variant="light"
                    className="fw-bold border px-4"
                    onClick={() =>
                      openActionModal({
                        title: "Save Draft",
                        message: "Save current verification form as draft?",
                        confirmText: "Save",
                        confirmVariant: "primary",
                        action: "save",
                      })
                    }
                  >
                    Save as Draft
                  </AppButton>
                  <div className="d-flex gap-2 flex-column flex-sm-row">
                    <AppButton
                      variant="secondary"
                      className="fw-bold px-4"
                      onClick={() =>
                        openActionModal({
                          title: "Cancel Changes",
                          message:
                            "Unsaved changes will be lost. Do you want to cancel?",
                          confirmText: "Yes, Cancel",
                          confirmVariant: "secondary",
                          action: "cancel",
                        })
                      }
                    >
                      Cancel
                    </AppButton>
                    <AppButton
                      className="btn-primary-custom fw-bold px-4"
                      onClick={handleContinueClick}
                    >
                      Continue
                    </AppButton>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={4}>
              <VerificationTipsCard tips={initialData.tips} />
            </Col>
          </Row>
        </div>
      </Container>

      <ConfirmActionModal
        show={modalConfig.show}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.confirmVariant}
        onCancel={closeActionModal}
        onConfirm={handleConfirmAction}
      />
    </section>
  );
};

export default ProfileVerificationPage;
