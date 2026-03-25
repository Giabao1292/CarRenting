import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminStatCard from "../../components/admin/dashboard/AdminStatCard";
import { APP_ROUTES } from "../../app/routes";
import { getAdminDashboard } from "../../services/admin/adminDashboardService";
import "../../style/admin/AdminDashboard.css";

const emptyDashboard = {
  totalUsers: 0,
  totalOwners: 0,
  totalAvailableCars: 0,
  revenueThisMonth: 0,
  topBookedVehicles: [],
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const pluralizeBookings = (value) => {
  const count = Number(value) || 0;
  return `${formatNumber(count)} lượt đặt`;
};

const normalizeImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
};

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getAdminDashboard();
        setDashboard({
          ...emptyDashboard,
          ...data,
          topBookedVehicles: Array.isArray(data?.topBookedVehicles)
            ? data.topBookedVehicles
            : [],
        });
      } catch (fetchError) {
        setDashboard(emptyDashboard);
        setError(fetchError.message || "Không thể tải bảng điều khiển quản trị");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Tổng người dùng",
        value: isLoading ? <Spinner animation="border" size="sm" /> : formatNumber(dashboard.totalUsers),
        meta: "Khách hàng đã đăng ký trên nền tảng",
        trend: "Người dùng",
        icon: "groups",
      },
      {
        label: "Tổng chủ xe",
        value: isLoading ? <Spinner animation="border" size="sm" /> : formatNumber(dashboard.totalOwners),
        meta: "Đối tác đang đăng bán hoặc quản lý xe",
        trend: "Chủ xe",
        icon: "badge",
      },
      {
        label: "Xe sẵn sàng",
        value: isLoading ? <Spinner animation="border" size="sm" /> : formatNumber(dashboard.totalAvailableCars),
        meta: "Các xe có thể đặt ngay lúc này",
        trend: "Kho xe",
        icon: "directions_car",
      },
      {
        label: "Doanh thu tháng này",
        value: isLoading ? <Spinner animation="border" size="sm" /> : formatCurrency(dashboard.revenueThisMonth),
        meta: "Doanh thu ghi nhận trong tháng hiện tại",
        trend: "Doanh thu",
        icon: "payments",
        highlight: true,
      },
    ],
    [dashboard, isLoading],
  );

  const topVehicles = useMemo(
    () =>
      (dashboard.topBookedVehicles || []).map((vehicle, index) => ({
        key: vehicle?.vehicleId ?? `${vehicle?.vehicleName || "xe"}-${index}`,
        rank: index + 1,
        id: vehicle?.vehicleId ?? null,
        name: vehicle?.vehicleName || "Xe chưa có tên",
        licensePlate: vehicle?.licensePlate || "--",
        ownerName: vehicle?.ownerName || "--",
        image: normalizeImageUrl(vehicle?.imageUrl),
        bookings: vehicle?.totalBookings ?? 0,
        revenue: vehicle?.totalRevenue ?? 0,
      })),
    [dashboard.topBookedVehicles],
  );

  return (
    <div className="admin-overview-page">
      <Card className="admin-overview-hero border-0 mb-4">
        <Card.Body className="p-4 p-lg-5">
          <div className="d-flex flex-column flex-xl-row align-items-xl-end justify-content-between gap-4">
            <div>
              <div className="admin-overview-eyebrow mb-2">Tổng quan quản trị</div>
              <h1 className="fw-bold display-5 mb-2">Tổng quan nền tảng</h1>
              <p className="admin-overview-subtitle mb-0">
                Theo dõi sức khỏe hệ thống qua người dùng, đối tác, xe sẵn sàng và doanh thu tháng hiện tại.
              </p>
            </div>
            <div className="admin-overview-actions">
              <Button
                as={Link}
                to={APP_ROUTES.ADMIN_CARS}
                variant="outline-success"
                className="fw-semibold rounded-pill px-4"
              >
                <span className="material-symbols-outlined align-middle me-2">
                  directions_car
                </span>
                Quản lý xe
              </Button>
              <Button
                as={Link}
                to={APP_ROUTES.ADMIN_BOOKINGS}
                className="btn-primary-custom fw-bold rounded-pill px-4"
              >
                <span className="material-symbols-outlined align-middle me-2">
                  book_online
                </span>
                Xem đặt xe
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {error ? (
        <Alert variant="danger" className="rounded-4 mb-4">
          {error}
        </Alert>
      ) : null}

      <Row className="g-3 mb-4">
        {stats.map((stat) => (
          <Col key={stat.label} sm={6} xl={3}>
            <AdminStatCard stat={stat} />
          </Col>
        ))}
      </Row>

      <Card className="admin-overview-panel border-0">
        <Card.Body>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <div className="admin-overview-section-title">
                Xe được đặt nhiều nhất
              </div>
              <div className="text-muted small mt-1">
                Hiển thị đúng theo DTO backend: xe, chủ xe, biển số, số lượt đặt và doanh thu.
              </div>
            </div>
            <Badge bg="light" text="dark" pill className="px-3 py-2">
              {formatNumber(topVehicles.length)} xe
            </Badge>
          </div>

          {isLoading ? (
            <div className="admin-overview-empty">
              <Spinner animation="border" size="sm" className="me-2" />
              Đang tải dữ liệu tổng quan...
            </div>
          ) : topVehicles.length ? (
            <div className="admin-overview-vehicles">
              {topVehicles.map((vehicle) => (
                <div className="admin-overview-vehicle" key={vehicle.key}>
                  <div className="admin-overview-vehicle-main">
                    <div className="admin-overview-rank">#{vehicle.rank}</div>
                    <div className="admin-overview-vehicle-media">
                      {vehicle.image ? (
                        <img src={vehicle.image} alt={vehicle.name} />
                      ) : (
                        <span className="material-symbols-outlined">
                          directions_car
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="admin-overview-vehicle-name">
                        {vehicle.name}
                      </div>
                      <div className="admin-overview-vehicle-subtext">
                        Biển số: {vehicle.licensePlate}
                      </div>
                      <div className="admin-overview-vehicle-subtext">
                        Chủ xe: {vehicle.ownerName}
                      </div>
                    </div>
                  </div>
                  <div className="admin-overview-vehicle-metrics">
                    <div className="admin-overview-booking-pill">
                      {pluralizeBookings(vehicle.bookings)}
                    </div>
                    <div className="admin-overview-revenue">
                      {formatCurrency(vehicle.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-overview-empty">
              Chưa có dữ liệu xe được đặt nhiều.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
