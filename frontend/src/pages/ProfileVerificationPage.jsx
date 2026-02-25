import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import ProfileProgressCard from "../components/profile-verification/ProfileProgressCard";
import UploadPlaceholder from "../components/profile-verification/UploadPlaceholder";
import VerificationTipsCard from "../components/profile-verification/VerificationTipsCard";
import { profileVerificationData } from "../data/profileVerificationData";

const ProfileVerificationPage = () => {
  return (
    <section className="bg-light-subtle py-4">
      <Container className="py-4 py-lg-5">
        <div className="d-grid gap-4">
          <ProfileProgressCard
            completion={profileVerificationData.completion}
            stepText={profileVerificationData.stepText}
          />

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
                        <Form.Label className="small fw-semibold">
                          Full Name
                        </Form.Label>
                        <Form.Control
                          placeholder="e.g. Alex Johnson"
                          defaultValue={
                            profileVerificationData.personalInfo.fullName
                          }
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="small fw-semibold">
                          Date of Birth
                        </Form.Label>
                        <Form.Control
                          type="date"
                          defaultValue={
                            profileVerificationData.personalInfo.dob
                          }
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="small fw-semibold">
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          defaultValue={
                            profileVerificationData.personalInfo.phone
                          }
                        />
                        <Form.Text className="text-muted">
                          Use an active phone number for verification updates.
                        </Form.Text>
                      </Col>
                      <Col md={6}>
                        <Form.Label className="small fw-semibold">
                          Nationality
                        </Form.Label>
                        <Form.Select
                          defaultValue={
                            profileVerificationData.personalInfo.nationality
                          }
                        >
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                          <option>Australia</option>
                        </Form.Select>
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
                                src={
                                  profileVerificationData.uploadedLicenseFront
                                }
                                alt="Uploaded license"
                              />
                              <button className="btn btn-light btn-sm fw-bold">
                                Remove
                              </button>
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
                  <Button variant="light" className="fw-bold border px-4">
                    Save as Draft
                  </Button>
                  <div className="d-flex gap-2 flex-column flex-sm-row">
                    <Button variant="secondary" className="fw-bold px-4">
                      Back
                    </Button>
                    <Button className="btn-primary-custom fw-bold px-4">
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={4}>
              <VerificationTipsCard tips={profileVerificationData.tips} />
            </Col>
          </Row>
        </div>
      </Container>
    </section>
  );
};

export default ProfileVerificationPage;
