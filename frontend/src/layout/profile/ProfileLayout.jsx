import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import AvatarUploader from "../../components/common/AvatarUploader";
import { useAuth } from "../../context/AuthContext";
import { uploadProfileAvatar } from "../../services/profile/profileAvatarService";
import ProfileSidebar from "./components/ProfileSidebar";
import { profileData } from "./profileData";

const StatusPill = ({ verified }) => (
  <button
    type="button"
    className={`profile-status-pill ${
      verified
        ? "profile-status-pill-verified"
        : "profile-status-pill-unverified"
    }`}
  >
    <span className="material-symbols-outlined profile-status-pill-icon">
      {verified ? "check_circle" : "priority_high"}
    </span>
    {verified ? "Đã xác thực" : "Chưa xác thực"}
  </button>
);

const ProfileLayout = () => {
  const { authUser, updateUserAvatar } = useAuth();
  const contextAvatar = authUser?.avatar || "";
  const [avatarUrl, setAvatarUrl] = useState(
    contextAvatar || profileData.user.avatar,
  );

  useEffect(() => {
    if (contextAvatar) {
      setAvatarUrl(contextAvatar);
      return;
    }

    setAvatarUrl(profileData.user.avatar);
  }, [contextAvatar]);

  const profileUser = useMemo(
    () => ({ ...profileData.user, avatar: avatarUrl }),
    [avatarUrl],
  );

  const handleAvatarUploaded = (uploadedAvatarUrl) => {
    setAvatarUrl(uploadedAvatarUrl);
    updateUserAvatar(uploadedAvatarUrl);
  };

  return (
    <section className="mt-5 bg-light-subtle profile-account-page">
      <Container className="py-4 py-lg-5">
        <Row className="g-4">
          <Col lg={3}>
            <ProfileSidebar user={profileUser} />
          </Col>

          <Col lg={9} className="d-grid gap-4">
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <h4 className="mb-0 fw-semibold">Thông tin tài khoản</h4>
                    <Button
                      variant="link"
                      className="p-0 text-muted d-inline-flex align-items-center"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18 }}
                      >
                        edit
                      </span>
                    </Button>
                  </div>
                  <div className="profile-trip-summary">
                    <span
                      className="material-symbols-outlined profile-trip-summary-icon"
                      aria-hidden="true"
                    >
                      luggage
                    </span>
                    <span className="profile-trip-summary-count">
                      {profileData.user.tripCount}
                    </span>
                    <span className="profile-trip-summary-label">chuyến</span>
                  </div>
                </div>

                <Row className="g-4">
                  <Col
                    md={4}
                    className="d-flex flex-column align-items-center text-center"
                  >
                    <AvatarUploader
                      src={avatarUrl}
                      alt={profileUser.name}
                      onUpload={uploadProfileAvatar}
                      onUploaded={handleAvatarUploaded}
                      className="profile-account-avatar-uploader mb-3"
                    />
                    <h5 className="mb-1 fw-semibold">{profileUser.name}</h5>
                    <p className="text-muted small mb-3">
                      Tham gia: {profileUser.joinedDate}
                    </p>
                    <div className="profile-points-chip">
                      <span
                        className="material-symbols-outlined profile-points-chip-icon"
                        aria-hidden="true"
                      >
                        workspace_premium
                      </span>
                      <span className="profile-points-chip-count">
                        {profileUser.points}
                      </span>
                      <span className="profile-points-chip-label">điểm</span>
                    </div>
                  </Col>

                  <Col md={8}>
                    <div className="profile-account-meta rounded-3 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted small">Ngày sinh</span>
                        <span className="fw-semibold">
                          {profileData.user.birthDate}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Giới tính</span>
                        <span className="fw-semibold">
                          {profileData.user.gender}
                        </span>
                      </div>
                    </div>

                    <div className="d-grid gap-3">
                      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                        <div className="small text-muted d-flex align-items-center gap-2">
                          Số điện thoại
                          <StatusPill verified={profileUser.phoneVerified} />
                        </div>
                        <Button
                          variant="link"
                          className="p-0 text-dark text-decoration-none d-inline-flex align-items-center gap-1"
                        >
                          Thêm số điện thoại
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            edit
                          </span>
                        </Button>
                      </div>

                      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                        <div className="small text-muted d-flex align-items-center gap-2">
                          Email
                          <StatusPill verified={profileUser.emailVerified} />
                        </div>
                        <div className="fw-semibold">{profileUser.email}</div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                        <div className="small text-muted">Địa chỉ</div>
                        <Button
                          variant="link"
                          className="p-0 text-dark text-decoration-none d-inline-flex align-items-center gap-1"
                        >
                          Thêm địa chỉ
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 16 }}
                          >
                            edit
                          </span>
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <h4 className="mb-0 fw-semibold">Giấy phép lái xe</h4>
                    <StatusPill verified={profileData.license.verified} />
                  </div>
                  <Button
                    variant="outline-dark"
                    className="rounded-3 px-3 d-inline-flex align-items-center gap-1"
                  >
                    Chỉnh sửa
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      edit
                    </span>
                  </Button>
                </div>

                <div className="profile-note profile-note-warning mb-2">
                  Khách thuê cần xác thực GPLX chính chủ động thời phải là người
                  trực tiếp làm thủ tục khi nhận xe.
                </div>
                <div className="profile-note profile-note-success mb-4">
                  Hình chụp cần thấy được ảnh đại diện và số GPLX rõ nét.
                </div>

                <Row className="g-4">
                  <Col md={5}>
                    <div className="small mb-2">Ảnh mặt trước GPLX</div>
                    <div className="profile-upload-box">
                      <span
                        className="material-symbols-outlined text-success"
                        style={{ fontSize: 44 }}
                      >
                        upload
                      </span>
                    </div>
                  </Col>

                  <Col md={7}>
                    <div className="small mb-2">Thông tin chung</div>
                    <div className="d-grid gap-3">
                      <Form.Control
                        value={profileData.license.number}
                        placeholder="Nhập số GPLX đã cấp"
                        readOnly
                      />
                      <Form.Control
                        value={profileData.license.fullName}
                        placeholder="Nhập đầy đủ họ tên"
                        readOnly
                      />
                      <Form.Control
                        value={profileData.license.birthDate}
                        placeholder="Ngày sinh"
                        readOnly
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProfileLayout;
