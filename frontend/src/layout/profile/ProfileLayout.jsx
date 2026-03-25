import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { APP_ROUTES } from "../../app/routes";
import AvatarUploader from "../../components/common/AvatarUploader";
import { useAuth } from "../../context/AuthContext";
import { uploadProfileAvatar } from "../../services/profile/profileAvatarService";
import { createReview } from "../../services/profile/profileReviewService";
import { getMyTrips } from "../../services/profile/profileTripService";
import ProfileTripCard from "./components/ProfileTripCard";
import ProfileSidebar from "./components/ProfileSidebar";
import { profileData } from "./profileData";

const DEFAULT_TRIP_IMAGE =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";

const formatCurrencyVnd = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "0đ";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateLabel = (value) => {
  if (!value) {
    return "--/--/----";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--/--/----";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const resolveTripStatus = (trip) => {
  const normalizedStatus = String(trip?.status || "").toLowerCase();
  if (normalizedStatus === "completed") {
    return { status: "Hoàn thành", statusKey: "completed" };
  }

  if (normalizedStatus === "cancelled") {
    return { status: "Đã huỷ", statusKey: "cancelled" };
  }

  const pickupAt = trip?.pickupAt ? new Date(trip.pickupAt) : null;
  if (pickupAt instanceof Date && !Number.isNaN(pickupAt.getTime())) {
    if (pickupAt.getTime() > Date.now()) {
      return { status: "Sắp diễn ra", statusKey: "upcoming" };
    }
  }

  return { status: "Đang diễn ra", statusKey: "ongoing" };
};

const mapMyTripToCard = (trip) => {
  const status = resolveTripStatus(trip);

  return {
    id: Number(trip?.bookingId || 0),
    bookingId: Number(trip?.bookingId || 0),
    vehicleId: Number(trip?.vehicleId || 0),
    status: status.status,
    statusKey: status.statusKey,
    name: String(trip?.vehicleName || "Xe thuê").trim(),
    category: "Xe tự lái",
    dates: `${formatDateLabel(trip?.pickupAt)} - ${formatDateLabel(trip?.dropoffAt)}`,
    location: String(trip?.pickupLocation || "Đang cập nhật").trim(),
    access: "Nhận xe theo hướng dẫn từ chủ xe",
    ownerPhone: String(trip?.ownerPhone || "").trim(),
    price: formatCurrencyVnd(trip?.totalAmount),
    image: String(trip?.vehicleImageUrl || "").trim() || DEFAULT_TRIP_IMAGE,
  };
};

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
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, updateUserAvatar } = useAuth();
  const contextAvatar = authUser?.avatar || "";
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tripItems, setTripItems] = useState([]);
  const [isTripsLoading, setIsTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState("");
  const [activeTripTab, setActiveTripTab] = useState("current");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTrip, setReviewTrip] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const activeSection = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") === "trips" ? "trips" : "account";
  }, [location.search]);

  const displayAvatar = avatarUrl || contextAvatar || profileData.user.avatar;

  const profileUser = useMemo(
    () => ({ ...profileData.user, avatar: displayAvatar }),
    [displayAvatar],
  );

  const currentTrips = useMemo(
    () =>
      tripItems.filter(
        (trip) =>
          trip.statusKey !== "completed" && trip.statusKey !== "cancelled",
      ),
    [tripItems],
  );

  const historyTrips = useMemo(
    () =>
      tripItems.filter(
        (trip) =>
          trip.statusKey === "completed" || trip.statusKey === "cancelled",
      ),
    [tripItems],
  );

  const visibleTrips = useMemo(() => {
    return activeTripTab === "history" ? historyTrips : currentTrips;
  }, [activeTripTab, currentTrips, historyTrips]);

  useEffect(() => {
    let isCancelled = false;

    const loadTrips = async () => {
      setIsTripsLoading(true);
      setTripsError("");

      try {
        const trips = await getMyTrips();
        if (!isCancelled) {
          setTripItems(trips.map(mapMyTripToCard));
        }
      } catch (error) {
        if (!isCancelled) {
          setTripsError(error?.message || "Không thể tải chuyến của bạn.");
          setTripItems([]);
        }
      } finally {
        if (!isCancelled) {
          setIsTripsLoading(false);
        }
      }
    };

    loadTrips();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleAvatarUploaded = (uploadedAvatarUrl) => {
    setAvatarUrl(uploadedAvatarUrl);
    updateUserAvatar(uploadedAvatarUrl);
  };

  const handleSelectSection = (sectionKey) => {
    if (sectionKey === "trips") {
      navigate("?tab=trips", { replace: true });
      return;
    }

    if (sectionKey === "account") {
      navigate(location.pathname, { replace: true });
    }
  };

  const handleOpenReviewModal = (trip) => {
    setReviewTrip(trip);
    setReviewRating(0);
    setReviewComment("");
    setReviewError("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    setReviewError("");

    if (!reviewTrip?.bookingId || !reviewTrip?.vehicleId) {
      setReviewError("Thiếu thông tin chuyến để gửi đánh giá.");
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError("Vui lòng chọn số sao đánh giá.");
      return;
    }

    if (!String(reviewComment || "").trim()) {
      setReviewError("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      await createReview({
        bookingId: reviewTrip.bookingId,
        vehicleId: reviewTrip.vehicleId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setShowReviewModal(false);
      const carDetailsPath = APP_ROUTES.CAR_DETAILS.replace(
        ":id",
        String(reviewTrip.vehicleId),
      );
      navigate(`${carDetailsPath}#reviews`);
    } catch (error) {
      setReviewError(error?.message || "Không thể gửi đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <section className="mt-5 bg-light-subtle profile-account-page">
      <Container className="py-4 py-lg-5">
        <Row className="g-4">
          <Col lg={3}>
            <ProfileSidebar
              user={profileUser}
              activeKey={activeSection}
              onSelect={handleSelectSection}
            />
          </Col>

          <Col lg={9} className="d-grid gap-4">
            {activeSection === "trips" ? (
              <>
                <Card className="border-0 shadow-sm rounded-4 profile-trips-shell">
                  <Card.Body className="p-4 p-md-5">
                    <h3 className="profile-trips-title">Chuyến của tôi</h3>

                    <div
                      className="profile-trips-tabs"
                      role="tablist"
                      aria-label="Bộ lọc chuyến đi"
                    >
                      <button
                        type="button"
                        className={`profile-trips-tab ${
                          activeTripTab === "current" ? "is-active" : ""
                        }`}
                        onClick={() => setActiveTripTab("current")}
                      >
                        Chuyến hiện tại
                      </button>
                      <button
                        type="button"
                        className={`profile-trips-tab ${
                          activeTripTab === "history" ? "is-active" : ""
                        }`}
                        onClick={() => setActiveTripTab("history")}
                      >
                        Lịch sử chuyến
                      </button>
                    </div>

                    <div className="d-grid gap-3 mt-4">
                      {isTripsLoading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status" />
                        </div>
                      ) : null}

                      {!isTripsLoading && tripsError ? (
                        <Alert variant="warning" className="mb-0">
                          {tripsError}
                        </Alert>
                      ) : null}

                      {!isTripsLoading &&
                      !tripsError &&
                      visibleTrips.length === 0 ? (
                        <div className="profile-trips-empty-state">
                          <div className="profile-trips-empty-state__icon-wrap">
                            <span className="material-symbols-outlined">
                              directions_car
                            </span>
                          </div>
                          <p className="profile-trips-empty-state__text">
                            Bạn chưa có chuyến
                          </p>
                        </div>
                      ) : null}

                      {!isTripsLoading && !tripsError && visibleTrips.length > 0
                        ? visibleTrips.map((trip) => (
                            <ProfileTripCard
                              key={`${activeTripTab}-${trip.id}`}
                              trip={trip}
                              onOpenReview={handleOpenReviewModal}
                            />
                          ))
                        : null}
                    </div>
                  </Card.Body>
                </Card>

                <Modal
                  show={showReviewModal}
                  onHide={() => setShowReviewModal(false)}
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Đánh giá chuyến đi</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="d-grid gap-3">
                      <div>
                        <div className="fw-semibold mb-1">
                          {reviewTrip?.name || "Xe thuê"}
                        </div>
                        <div className="text-muted small">
                          Chọn số sao của bạn
                        </div>
                      </div>

                      <div
                        className="profile-review-stars"
                        role="radiogroup"
                        aria-label="Chọn số sao"
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`profile-review-star ${
                              reviewRating >= star ? "is-active" : ""
                            }`}
                            onClick={() => setReviewRating(star)}
                            aria-label={`${star} sao`}
                          >
                            <span className="material-symbols-outlined">
                              star
                            </span>
                          </button>
                        ))}
                      </div>

                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={reviewComment}
                        onChange={(event) =>
                          setReviewComment(event.target.value)
                        }
                        placeholder="Hãy chia sẻ trải nghiệm chuyến đi của bạn..."
                      />

                      {reviewError ? (
                        <Alert variant="warning" className="mb-0 py-2">
                          {reviewError}
                        </Alert>
                      ) : null}

                      <Button
                        className="btn-primary-custom"
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                      >
                        {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                      </Button>
                    </div>
                  </Modal.Body>
                </Modal>
              </>
            ) : (
              <>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="d-flex align-items-center gap-2">
                        <h4 className="mb-0 fw-semibold">
                          Thông tin tài khoản
                        </h4>
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
                          {tripItems.length}
                        </span>
                        <span className="profile-trip-summary-label">
                          chuyến
                        </span>
                      </div>
                    </div>

                    <Row className="g-4">
                      <Col
                        md={4}
                        className="d-flex flex-column align-items-center text-center"
                      >
                        <AvatarUploader
                          src={displayAvatar}
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
                          <span className="profile-points-chip-label">
                            điểm
                          </span>
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
                              <StatusPill
                                verified={profileUser.phoneVerified}
                              />
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
                              <StatusPill
                                verified={profileUser.emailVerified}
                              />
                            </div>
                            <div className="fw-semibold">
                              {profileUser.email}
                            </div>
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
                      Khách thuê cần xác thực GPLX chính chủ động thời phải là
                      người trực tiếp làm thủ tục khi nhận xe.
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
              </>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProfileLayout;
