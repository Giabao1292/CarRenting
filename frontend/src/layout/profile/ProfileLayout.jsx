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
import { changePassword } from "../../services/authService";
import { uploadProfileAvatar } from "../../services/profile/profileAvatarService";
import {
  getMyLicenseProfile,
  submitMyLicenseProfile,
} from "../../services/profile/profileLicenseService";
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

const formatDateForInput = (value) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
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
  const reviewId = Number(trip?.reviewId || 0);
  const reviewRating = Number(trip?.reviewRating || 0);
  const reviewComment = String(trip?.reviewComment || "").trim();

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
    reviewId: reviewId > 0 ? reviewId : null,
    reviewRating: reviewRating >= 1 && reviewRating <= 5 ? reviewRating : 0,
    reviewComment,
    reviewed: reviewId > 0,
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

const LicenseStatusPill = ({ status }) => {
  const normalizedStatus = String(status || "NOT_SUBMITTED")
    .trim()
    .toLowerCase();

  if (normalizedStatus === "approved") {
    return <StatusPill verified />;
  }

  if (normalizedStatus === "pending") {
    return (
      <button
        type="button"
        className="profile-status-pill profile-status-pill-unverified"
      >
        <span className="material-symbols-outlined profile-status-pill-icon">
          schedule
        </span>
        Chờ xác thực
      </button>
    );
  }

  if (normalizedStatus === "rejected") {
    return (
      <button
        type="button"
        className="profile-status-pill profile-status-pill-rejected"
      >
        <span className="material-symbols-outlined profile-status-pill-icon">
          cancel
        </span>
        Bị từ chối
      </button>
    );
  }

  return <StatusPill verified={false} />;
};

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTrip, setReviewTrip] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [licenseProfile, setLicenseProfile] = useState(null);
  const [isLicenseLoading, setIsLicenseLoading] = useState(false);
  const [isLicenseSubmitting, setIsLicenseSubmitting] = useState(false);
  const [licenseNumberInput, setLicenseNumberInput] = useState("");
  const [licenseFrontFile, setLicenseFrontFile] = useState(null);
  const [licenseBackFile, setLicenseBackFile] = useState(null);
  const [licenseFrontPreview, setLicenseFrontPreview] = useState("");
  const [licenseBackPreview, setLicenseBackPreview] = useState("");
  const [licenseMessage, setLicenseMessage] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const isReviewReadOnly = Boolean(reviewTrip?.reviewed);
  const normalizedLicenseStatus = String(
    licenseProfile?.verificationStatus || "NOT_SUBMITTED",
  )
    .trim()
    .toLowerCase();
  const isLicenseLocked =
    normalizedLicenseStatus === "pending" ||
    normalizedLicenseStatus === "approved";
  const shouldShowLicenseNotes = normalizedLicenseStatus !== "approved";

  const activeSection = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const section = params.get("section");

    if (tab === "trips") {
      return "trips";
    }

    if (section === "change-password") {
      return "password";
    }

    return "account";
  }, [location.search]);

  const displayAvatar = avatarUrl || contextAvatar || profileData.user.avatar;

  const profileUser = useMemo(() => {
    const resolvedName = String(
      licenseProfile?.fullName ||
        authUser?.fullName ||
        authUser?.name ||
        profileData.user.name ||
        "Người dùng",
    ).trim();
    const resolvedEmail = String(
      licenseProfile?.email || authUser?.email || profileData.user.email || "",
    ).trim();
    const resolvedPhone = String(licenseProfile?.phone || "").trim();
    const resolvedAddress = String(licenseProfile?.address || "").trim();

    return {
      ...profileData.user,
      name: resolvedName,
      fullName: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      address: resolvedAddress,
      birthDate: formatDateLabel(licenseProfile?.dob),
      gender: String(authUser?.gender || "").trim() || "--",
      joinedDate: String(authUser?.createdAt || "").trim()
        ? formatDateLabel(authUser.createdAt)
        : "--/--/----",
      phoneVerified: Boolean(resolvedPhone),
      emailVerified: Boolean(resolvedEmail),
      avatar: displayAvatar,
    };
  }, [authUser, displayAvatar, licenseProfile]);

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

  useEffect(() => {
    let isCancelled = false;

    const loadLicenseProfile = async () => {
      setIsLicenseLoading(true);
      setLicenseError("");

      try {
        const profile = await getMyLicenseProfile();
        if (isCancelled) {
          return;
        }

        setLicenseProfile(profile);
        setLicenseNumberInput(String(profile?.licenseNumber || ""));
      } catch (error) {
        if (!isCancelled) {
          setLicenseError(
            error?.message || "Không thể tải thông tin giấy phép lái xe.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLicenseLoading(false);
        }
      }
    };

    loadLicenseProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (licenseFrontPreview) {
        URL.revokeObjectURL(licenseFrontPreview);
      }
      if (licenseBackPreview) {
        URL.revokeObjectURL(licenseBackPreview);
      }
    };
  }, [licenseFrontPreview, licenseBackPreview]);

  const handleAvatarUploaded = (uploadedAvatarUrl) => {
    setAvatarUrl(uploadedAvatarUrl);
    updateUserAvatar(uploadedAvatarUrl);
  };

  const handleSelectSection = (sectionKey) => {
    if (sectionKey === "trips") {
      navigate("?tab=trips", { replace: true });
      return;
    }

    if (sectionKey === "password") {
      navigate("?section=change-password", { replace: true });
      return;
    }

    if (sectionKey === "account") {
      navigate(location.pathname, { replace: true });
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Đổi mật khẩu thành công.");
    } catch (error) {
      setPasswordError(error?.message || "Không thể đổi mật khẩu.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleOpenReviewModal = (trip) => {
    setReviewTrip(trip);
    setReviewRating(Number(trip?.reviewRating || 0));
    setReviewComment(String(trip?.reviewComment || ""));
    setReviewError("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    setReviewError("");

    if (!reviewTrip?.bookingId || !reviewTrip?.vehicleId) {
      setReviewError("Thiếu thông tin chuyến để gửi đánh giá.");
      return;
    }

    if (isReviewReadOnly) {
      setReviewError("Bạn đã đánh giá chuyến này rồi.");
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

  const handleSelectLicenseFront = (event) => {
    if (isLicenseLocked) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (licenseFrontPreview) {
      URL.revokeObjectURL(licenseFrontPreview);
    }

    setLicenseFrontFile(file);
    setLicenseFrontPreview(URL.createObjectURL(file));
  };

  const handleSelectLicenseBack = (event) => {
    if (isLicenseLocked) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (licenseBackPreview) {
      URL.revokeObjectURL(licenseBackPreview);
    }

    setLicenseBackFile(file);
    setLicenseBackPreview(URL.createObjectURL(file));
  };

  const handleSubmitLicenseProfile = async (event) => {
    event.preventDefault();
    setLicenseError("");
    setLicenseMessage("");

    if (isLicenseLocked) {
      return;
    }

    const normalizedLicenseNumber = String(licenseNumberInput || "").trim();
    if (!normalizedLicenseNumber) {
      setLicenseError("Vui lòng nhập số GPLX.");
      return;
    }

    const hasFrontImage = Boolean(
      licenseFrontFile || licenseProfile?.licenseFrontUrl,
    );
    const hasBackImage = Boolean(
      licenseBackFile || licenseProfile?.licenseBackUrl,
    );

    if (!hasFrontImage || !hasBackImage) {
      setLicenseError("Vui lòng tải đủ ảnh mặt trước và mặt sau GPLX.");
      return;
    }

    try {
      setIsLicenseSubmitting(true);
      const updated = await submitMyLicenseProfile({
        licenseNumber: normalizedLicenseNumber,
        frontImage: licenseFrontFile,
        backImage: licenseBackFile,
      });

      setLicenseProfile(updated);
      setLicenseNumberInput(
        String(updated?.licenseNumber || normalizedLicenseNumber),
      );
      setLicenseMessage("Đã nộp giấy phép lái xe thành công.");

      if (licenseFrontPreview) {
        URL.revokeObjectURL(licenseFrontPreview);
      }
      if (licenseBackPreview) {
        URL.revokeObjectURL(licenseBackPreview);
      }
      setLicenseFrontPreview("");
      setLicenseBackPreview("");
      setLicenseFrontFile(null);
      setLicenseBackFile(null);
    } catch (error) {
      setLicenseError(
        error?.message || "Không thể nộp hồ sơ giấy phép lái xe.",
      );
    } finally {
      setIsLicenseSubmitting(false);
    }
  };

  const resolvedLicenseVerified =
    Boolean(licenseProfile?.verified) || profileData.license.verified;
  const resolvedLicenseFrontPreview =
    licenseFrontPreview || String(licenseProfile?.licenseFrontUrl || "");
  const resolvedLicenseBackPreview =
    licenseBackPreview || String(licenseProfile?.licenseBackUrl || "");

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
                          {isReviewReadOnly
                            ? "Đánh giá bạn đã gửi"
                            : "Chọn số sao của bạn"}
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
                            disabled={isReviewReadOnly}
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
                        placeholder={
                          isReviewReadOnly
                            ? "Nội dung đánh giá của bạn"
                            : "Hãy chia sẻ trải nghiệm chuyến đi của bạn..."
                        }
                        readOnly={isReviewReadOnly}
                      />

                      {reviewError ? (
                        <Alert variant="warning" className="mb-0 py-2">
                          {reviewError}
                        </Alert>
                      ) : null}

                      {!isReviewReadOnly ? (
                        <Button
                          className="btn-primary-custom"
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview}
                        >
                          {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                        </Button>
                      ) : null}
                    </div>
                  </Modal.Body>
                </Modal>
              </>
            ) : activeSection === "password" ? (
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4 p-md-5">
                  <h4 className="fw-bold mb-2">Đổi mật khẩu</h4>
                  <p className="text-muted mb-4">
                    Cập nhật mật khẩu mới để bảo vệ tài khoản của bạn.
                  </p>

                  <Form
                    className="d-grid gap-3"
                    onSubmit={handleChangePassword}
                  >
                    <Form.Group controlId="current-password">
                      <Form.Label>Mật khẩu hiện tại</Form.Label>
                      <Form.Control
                        type="password"
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(event.target.value)
                        }
                        placeholder="Nhập mật khẩu hiện tại"
                        autoComplete="current-password"
                      />
                    </Form.Group>

                    <Form.Group controlId="new-password">
                      <Form.Label>Mật khẩu mới</Form.Label>
                      <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        autoComplete="new-password"
                      />
                    </Form.Group>

                    <Form.Group controlId="confirm-new-password">
                      <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Nhập lại mật khẩu mới"
                        autoComplete="new-password"
                      />
                    </Form.Group>

                    {passwordError ? (
                      <Alert variant="warning" className="mb-0 py-2">
                        {passwordError}
                      </Alert>
                    ) : null}

                    {passwordMessage ? (
                      <Alert variant="success" className="mb-0 py-2">
                        {passwordMessage}
                      </Alert>
                    ) : null}

                    <div className="d-flex gap-2 mt-2">
                      <Button
                        type="submit"
                        className="btn-primary-custom px-4"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword
                          ? "Đang cập nhật..."
                          : "Cập nhật mật khẩu"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() =>
                          navigate(location.pathname, { replace: true })
                        }
                      >
                        Huỷ
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
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
                              {profileUser.birthDate}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">Giới tính</span>
                            <span className="fw-semibold">
                              {profileUser.gender}
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
                            <div className="fw-semibold">
                              {profileUser.phone || "Chưa cập nhật"}
                            </div>
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
                            <div className="fw-semibold">
                              {profileUser.address || "Chưa cập nhật"}
                            </div>
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
                        <LicenseStatusPill
                          status={licenseProfile?.verificationStatus}
                        />
                      </div>
                    </div>

                    {shouldShowLicenseNotes ? (
                      <>
                        <div className="profile-note profile-note-warning mb-2">
                          Khách thuê cần xác thực GPLX chính chủ động thời phải
                          là người trực tiếp làm thủ tục khi nhận xe.
                        </div>
                        <div className="profile-note profile-note-success mb-4">
                          Hình chụp cần thấy được ảnh đại diện và số GPLX rõ
                          nét.
                        </div>
                      </>
                    ) : null}

                    {isLicenseLoading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" role="status" />
                      </div>
                    ) : (
                      <Form onSubmit={handleSubmitLicenseProfile}>
                        <Row className="g-4">
                          <Col md={6}>
                            <div className="small mb-2">Ảnh mặt trước GPLX</div>
                            {resolvedLicenseFrontPreview ? (
                              <div className="profile-upload-preview">
                                <img
                                  src={resolvedLicenseFrontPreview}
                                  alt="Ảnh mặt trước GPLX"
                                />
                              </div>
                            ) : isLicenseLocked ? (
                              <div className="profile-upload-box text-muted">
                                Chưa có ảnh mặt trước
                              </div>
                            ) : (
                              <label
                                className="profile-upload-box w-100"
                                htmlFor="license-front-upload"
                              >
                                <span
                                  className="material-symbols-outlined text-success"
                                  style={{ fontSize: 44 }}
                                >
                                  upload
                                </span>
                              </label>
                            )}
                            {!isLicenseLocked ? (
                              <Form.Control
                                id="license-front-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleSelectLicenseFront}
                                className="mt-2"
                              />
                            ) : null}
                          </Col>

                          <Col md={6}>
                            <div className="small mb-2">Ảnh mặt sau GPLX</div>
                            {resolvedLicenseBackPreview ? (
                              <div className="profile-upload-preview">
                                <img
                                  src={resolvedLicenseBackPreview}
                                  alt="Ảnh mặt sau GPLX"
                                />
                              </div>
                            ) : isLicenseLocked ? (
                              <div className="profile-upload-box text-muted">
                                Chưa có ảnh mặt sau
                              </div>
                            ) : (
                              <label
                                className="profile-upload-box w-100"
                                htmlFor="license-back-upload"
                              >
                                <span
                                  className="material-symbols-outlined text-success"
                                  style={{ fontSize: 44 }}
                                >
                                  upload
                                </span>
                              </label>
                            )}
                            {!isLicenseLocked ? (
                              <Form.Control
                                id="license-back-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleSelectLicenseBack}
                                className="mt-2"
                              />
                            ) : null}
                          </Col>

                          <Col md={12}>
                            <div className="small mb-2">
                              Thông tin trong profile người dùng
                            </div>
                            <div className="d-grid gap-3">
                              <Form.Control
                                value={licenseNumberInput}
                                onChange={(event) =>
                                  setLicenseNumberInput(event.target.value)
                                }
                                placeholder="Nhập số GPLX đã cấp"
                                readOnly={isLicenseLocked}
                              />
                              <Form.Control
                                value={String(
                                  licenseProfile?.fullName ||
                                    profileUser.name ||
                                    "",
                                )}
                                placeholder="Họ và tên"
                                readOnly
                              />
                              <Form.Control
                                value={formatDateForInput(licenseProfile?.dob)}
                                placeholder="Ngày sinh"
                                readOnly
                              />
                              <Form.Control
                                value={String(licenseProfile?.phone || "")}
                                placeholder="Số điện thoại"
                                readOnly
                              />
                            </div>
                          </Col>
                        </Row>

                        {licenseError ? (
                          <Alert variant="warning" className="mt-3 mb-0 py-2">
                            {licenseError}
                          </Alert>
                        ) : null}

                        {licenseMessage ? (
                          <Alert variant="success" className="mt-3 mb-0 py-2">
                            {licenseMessage}
                          </Alert>
                        ) : null}

                        {!isLicenseLocked ? (
                          <div className="mt-3 d-flex justify-content-end">
                            <Button
                              type="submit"
                              className="btn-primary-custom px-4"
                              disabled={isLicenseSubmitting}
                            >
                              {isLicenseSubmitting
                                ? "Đang nộp..."
                                : "Nộp giấy phép lái xe"}
                            </Button>
                          </div>
                        ) : null}
                      </Form>
                    )}
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
