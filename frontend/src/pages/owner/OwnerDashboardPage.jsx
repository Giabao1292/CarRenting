import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import BookingRequestCard from "../../components/owner/dashboard/BookingRequestCard";
import EarningsTable from "../../components/owner/dashboard/EarningsTable";
import FleetItemCard from "../../components/owner/dashboard/FleetItemCard";
import OwnerStatCard from "../../components/owner/dashboard/OwnerStatCard";
import {
  getBookingRequests,
  getMyCars,
  getOwnerTime,
  updateCarStatus,
  updateOwnerTime,
  updateOwnerTimeWithParams,
} from "../../services/ownerService";

const formatCurrencyVnd = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "0 VND";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
};

const normalizeStatus = (value) => String(value || "inactive").toLowerCase();

const normalizeTimeValue = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();
  const matched = trimmedValue.match(/^(\d{2}:\d{2})/);
  if (!matched) {
    return fallback;
  }

  return matched[1];
};

const mapCars = (cars = []) =>
  cars.map((car) => ({
    id: car.id,
    name: car.name || "Xe chưa đặt tên",
    imageUrl: car.imageUrl || "",
    status: normalizeStatus(car.status),
    pricePerDay: Number(car.pricePerDay) || 0,
    rating: Number(car.rating) || 0,
  }));

const mapBookings = (bookings = []) =>
  bookings.map((booking, index) => ({
    id: `${booking.vehicleId || booking.bookingId || "vehicle"}-${index}`,
    vehicleId: booking.vehicleId,
    status: normalizeStatus(booking.status),
    vehicleName: booking.vehicleName || "Chưa rõ xe",
    imageUrl: booking.imageUrl || "",
  }));

const OwnerDashboardPage = () => {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [isUpdatingCarStatus, setIsUpdatingCarStatus] = useState(false);
  const [statusAction, setStatusAction] = useState(null);
  const [ownerOpenTime, setOwnerOpenTime] = useState("08:00");
  const [ownerCloseTime, setOwnerCloseTime] = useState("20:00");
  const [ownerTimeFeedback, setOwnerTimeFeedback] = useState(null);
  const [isUpdatingOwnerTime, setIsUpdatingOwnerTime] = useState(false);
  const [pendingOwnerTimeUpdate, setPendingOwnerTimeUpdate] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [carsResponse, bookingsResponse] = await Promise.all([
          getMyCars(),
          getBookingRequests(),
        ]);

        if (isCancelled) {
          return;
        }

        setCars(mapCars(carsResponse));
        setBookings(mapBookings(bookingsResponse));
      } catch {
        if (!isCancelled) {
          setErrorMessage(
            "Không thể tải dữ liệu dashboard chủ xe. Vui lòng thử lại.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadOwnerTime = async () => {
      try {
        const ownerTime = await getOwnerTime();

        if (isCancelled || !ownerTime) {
          return;
        }

        setOwnerOpenTime((previousTime) =>
          normalizeTimeValue(ownerTime.open, previousTime),
        );
        setOwnerCloseTime((previousTime) =>
          normalizeTimeValue(ownerTime.close, previousTime),
        );
      } catch {
        // Keep default values when owner time is not available.
      }
    };

    loadOwnerTime();

    return () => {
      isCancelled = true;
    };
  }, []);

  const statusCounts = useMemo(() => {
    return cars.reduce(
      (accumulator, car) => {
        const status = normalizeStatus(car.status);
        if (Object.prototype.hasOwnProperty.call(accumulator, status)) {
          accumulator[status] += 1;
        }

        return accumulator;
      },
      {
        rented: 0,
        available: 0,
        inactive: 0,
        rejected: 0,
        pending: 0,
      },
    );
  }, [cars]);

  const stats = useMemo(
    () => [
      {
        label: "Tổng số xe",
        value: String(cars.length),
        trend: `${statusCounts.pending} pending / ${statusCounts.rejected} rejected`,
        icon: "directions_car",
      },
      {
        label: "Đang thuê",
        value: String(statusCounts.rented),
        trend: "Rented",
        icon: "key",
      },
      {
        label: "Tạm ngưng",
        value: String(statusCounts.inactive),
        trend: "Inactive",
        icon: "pause_circle",
      },
      {
        label: "Sẵn sàng",
        value: String(statusCounts.available),
        trend: "Available",
        icon: "check_circle",
      },
    ],
    [cars.length, statusCounts],
  );

  const bookingSectionCars = useMemo(() => bookings, [bookings]);

  const earningsRows = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.status !== "pending" &&
          booking.pickupAt &&
          booking.dropoffAt &&
          booking.totalAmount,
      )
      .slice(0, 7)
      .map((booking) => ({
        id: booking.id,
        car: booking.vehicleName,
        dates: `${booking.pickupAt} - ${booking.dropoffAt}`,
        status: booking.status,
        amount: booking.totalAmount,
      }));
  }, [bookings]);

  const handleToggleCarStatus = (car) => {
    const currentStatus = normalizeStatus(car?.status);
    const nextStatus = currentStatus === "inactive" ? "available" : "inactive";

    if (currentStatus === "rented" && nextStatus === "inactive") {
      setStatusFeedback({
        variant: "warning",
        message: "Xe đang ở trạng thái rented nên không thể tắt tạm thời.",
      });
      return;
    }

    setStatusAction({
      id: car.id,
      name: car.name,
      nextStatus,
    });
  };

  const handleConfirmToggleCarStatus = async () => {
    if (!statusAction?.id || !statusAction?.nextStatus) {
      return;
    }

    setIsUpdatingCarStatus(true);
    setStatusFeedback(null);

    try {
      await updateCarStatus(
        statusAction.id,
        statusAction.nextStatus.toUpperCase(),
      );

      setCars((previousCars) =>
        previousCars.map((car) =>
          car.id === statusAction.id
            ? { ...car, status: statusAction.nextStatus }
            : car,
        ),
      );

      setStatusFeedback({
        variant: "success",
        message:
          statusAction.nextStatus === "inactive"
            ? `Đã tắt xe ${statusAction.name} thành công.`
            : `Đã mở xe ${statusAction.name} thành công.`,
      });
    } catch {
      setStatusFeedback({
        variant: "warning",
        message: "Cập nhật trạng thái xe thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIsUpdatingCarStatus(false);
      setStatusAction(null);
    }
  };

  const handleUpdateOwnerTime = async () => {
    if (!ownerOpenTime || !ownerCloseTime) {
      setOwnerTimeFeedback({
        variant: "warning",
        message: "Vui lòng chọn đầy đủ giờ mở cửa và đóng cửa.",
      });
      return;
    }

    if (ownerOpenTime >= ownerCloseTime) {
      setOwnerTimeFeedback({
        variant: "warning",
        message: "Giờ mở cửa phải sớm hơn giờ đóng cửa.",
      });
      return;
    }

    setPendingOwnerTimeUpdate({
      open: ownerOpenTime,
      close: ownerCloseTime,
    });
  };

  const handleConfirmUpdateOwnerTime = async () => {
    if (!pendingOwnerTimeUpdate) {
      return;
    }

    setIsUpdatingOwnerTime(true);
    setOwnerTimeFeedback(null);

    try {
      await updateOwnerTime({
        open: pendingOwnerTimeUpdate.open,
        close: pendingOwnerTimeUpdate.close,
      });

      setOwnerTimeFeedback({
        variant: "success",
        message: "Cập nhật thời gian hoạt động thành công.",
      });
    } catch (error) {
      if (error?.response?.status === 415) {
        try {
          await updateOwnerTimeWithParams({
            open: pendingOwnerTimeUpdate.open,
            close: pendingOwnerTimeUpdate.close,
          });

          setOwnerTimeFeedback({
            variant: "success",
            message: "Cập nhật thời gian hoạt động thành công.",
          });
        } catch {
          setOwnerTimeFeedback({
            variant: "warning",
            message: "Cập nhật thời gian hoạt động thất bại. Vui lòng thử lại.",
          });
        }
      } else {
        setOwnerTimeFeedback({
          variant: "warning",
          message: "Cập nhật thời gian hoạt động thất bại. Vui lòng thử lại.",
        });
      }
    } finally {
      setIsUpdatingOwnerTime(false);
      setPendingOwnerTimeUpdate(null);
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
    <>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Owner Dashboard</h2>
          <p className="text-muted mb-0">
            Theo dõi nhanh đội xe theo 5 trạng thái: rented, available,
            inactive, rejected, pending.
          </p>
        </div>
        <Button variant="outline-secondary" className="fw-bold">
          <span className="material-symbols-outlined align-middle me-1">
            download
          </span>
          Export Report
        </Button>
      </div>

      {errorMessage ? (
        <Alert variant="warning" className="mb-3">
          {errorMessage}
        </Alert>
      ) : null}

      {statusFeedback ? (
        <Alert
          variant={statusFeedback.variant}
          className="mb-3"
          dismissible
          onClose={() => setStatusFeedback(null)}
        >
          {statusFeedback.message}
        </Alert>
      ) : null}

      <Row className="g-3 mb-4">
        {stats.map((stat) => (
          <Col key={stat.label} sm={6} xl={3}>
            <OwnerStatCard stat={stat} />
          </Col>
        ))}
      </Row>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <span className="badge text-bg-primary">
          available: {statusCounts.available}
        </span>
        <span className="badge text-bg-success">
          rented: {statusCounts.rented}
        </span>
        <span className="badge text-bg-secondary">
          inactive: {statusCounts.inactive}
        </span>
        <span className="badge text-bg-warning">
          pending: {statusCounts.pending}
        </span>
        <span className="badge text-bg-danger">
          rejected: {statusCounts.rejected}
        </span>
      </div>

      <Row className="g-4">
        <Col xl={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Danh sách xe của bạn</h5>
            <a href="#" className="text-success fw-bold small">
              Xem tất cả
            </a>
          </div>
          <div className="d-grid gap-3">
            {bookingSectionCars.length ? (
              bookingSectionCars.map((request) => (
                <BookingRequestCard
                  key={request.id}
                  request={request}
                  manageHref={APP_ROUTES.OWNER_CAR_MANAGE.replace(
                    ":id",
                    String(request.vehicleId || ""),
                  )}
                />
              ))
            ) : (
              <Alert variant="light" className="mb-0">
                Chưa có xe trong danh sách của bạn.
              </Alert>
            )}
          </div>
        </Col>

        <Col xl={4}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">My Fleet</h5>
            <Button variant="light" size="sm" className="rounded-circle p-1">
              <span className="material-symbols-outlined">more_horiz</span>
            </Button>
          </div>

          <div className="border rounded-4 p-3 bg-white mb-3">
            <h6 className="fw-bold mb-2">Owner Open Time</h6>
            <p className="small text-muted mb-3">
              Cập nhật khung giờ nhận xe của bạn để khách dễ theo dõi.
            </p>

            {ownerTimeFeedback ? (
              <Alert
                variant={ownerTimeFeedback.variant}
                className="py-2 px-3 mb-3 small"
              >
                {ownerTimeFeedback.message}
              </Alert>
            ) : null}

            <div className="d-flex gap-2 mb-3">
              <Form.Group className="flex-fill">
                <Form.Label className="small text-muted mb-1">
                  Open time
                </Form.Label>
                <Form.Control
                  type="time"
                  value={ownerOpenTime}
                  onChange={(event) => setOwnerOpenTime(event.target.value)}
                  disabled={isUpdatingOwnerTime}
                />
              </Form.Group>

              <Form.Group className="flex-fill">
                <Form.Label className="small text-muted mb-1">
                  Close time
                </Form.Label>
                <Form.Control
                  type="time"
                  value={ownerCloseTime}
                  onChange={(event) => setOwnerCloseTime(event.target.value)}
                  disabled={isUpdatingOwnerTime}
                />
              </Form.Group>
            </div>

            <Button
              variant="success"
              className="w-100"
              onClick={handleUpdateOwnerTime}
              disabled={isUpdatingOwnerTime}
            >
              {isUpdatingOwnerTime ? "Đang lưu..." : "Lưu thời gian"}
            </Button>
          </div>

          <div className="d-grid gap-3">
            {cars.length ? (
              cars.map((car) => (
                <FleetItemCard
                  key={car.id}
                  car={car}
                  isUpdating={
                    isUpdatingCarStatus && statusAction?.id === car.id
                  }
                  onToggleStatus={handleToggleCarStatus}
                />
              ))
            ) : (
              <Alert variant="light" className="mb-0">
                Chưa có xe trong danh sách của bạn.
              </Alert>
            )}
            <Button
              as={Link}
              to={APP_ROUTES.OWNER_ADD_CAR}
              variant="light"
              className="fw-bold border border-dashed"
            >
              <span className="material-symbols-outlined align-middle me-1">
                add
              </span>
              Add Another Car
            </Button>
          </div>
        </Col>
      </Row>

      <EarningsTable rows={earningsRows} />

      <ConfirmActionModal
        show={Boolean(statusAction)}
        title={
          statusAction?.nextStatus === "inactive"
            ? "Xác nhận tắt xe"
            : "Xác nhận mở xe"
        }
        message={
          statusAction?.nextStatus === "inactive"
            ? `Bạn có chắc muốn chuyển xe ${statusAction?.name || "này"} sang trạng thái Inactive không?`
            : `Bạn có chắc muốn chuyển xe ${statusAction?.name || "này"} sang trạng thái Available không?`
        }
        confirmText="Đồng ý"
        confirmVariant={
          statusAction?.nextStatus === "inactive" ? "danger" : "success"
        }
        onCancel={() => {
          if (isUpdatingCarStatus) {
            return;
          }

          setStatusAction(null);
        }}
        onConfirm={handleConfirmToggleCarStatus}
      />

      <ConfirmActionModal
        show={Boolean(pendingOwnerTimeUpdate)}
        title="Xác nhận cập nhật thời gian"
        message={`Bạn có chắc muốn cập nhật khung giờ hoạt động từ ${pendingOwnerTimeUpdate?.open || "--:--"} đến ${pendingOwnerTimeUpdate?.close || "--:--"} không?`}
        confirmText={isUpdatingOwnerTime ? "Đang cập nhật..." : "Đồng ý"}
        confirmVariant="success"
        onCancel={() => {
          if (isUpdatingOwnerTime) {
            return;
          }

          setPendingOwnerTimeUpdate(null);
        }}
        onConfirm={handleConfirmUpdateOwnerTime}
      />
    </>
  );
};

export default OwnerDashboardPage;
