import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  getAdminBookingDetail,
  getAdminBookings,
  getBookingCountStats,
  getBookingRevenueStats,
  getBookingStatusStats,
  getTopBookedVehicles,
} from "../../services/admin/adminBookingsService";
import "../../style/admin/BookingManagement.css";

const PAGE_SIZE = 10;

const mockBookingsPage = {
  content: [
    {
      id: 1,
      bookingCode: "VLC-98210",
      customerName: "Nguyen An",
      customerEmail: "an.nguyen@email.com",
      pickupLocation: "Tan Son Nhat Apt, HCMC",
      pickupAt: "2023-11-12T09:00:00",
      dropoffAt: "2023-11-15T09:00:00",
      totalAmount: 4500000,
      status: "COMPLETED",
      createdAt: "2023-11-01T08:00:00",
    },
    {
      id: 2,
      bookingCode: "VLC-98211",
      customerName: "Tran Minh",
      customerEmail: "minh.tran@email.com",
      pickupLocation: "District 1 Center, HCMC",
      pickupAt: "2023-11-20T09:00:00",
      dropoffAt: "2023-11-22T09:00:00",
      totalAmount: 2800000,
      status: "PENDING",
      createdAt: "2023-11-05T10:00:00",
    },
    {
      id: 3,
      bookingCode: "VLC-98212",
      customerName: "Le Hoa",
      customerEmail: "hoa.le@email.com",
      pickupLocation: "Da Nang Airport",
      pickupAt: "2023-11-18T13:00:00",
      dropoffAt: "2023-11-19T13:00:00",
      totalAmount: 1200000,
      status: "CANCELLED",
      createdAt: "2023-11-07T11:00:00",
    },
    {
      id: 4,
      bookingCode: "VLC-98213",
      customerName: "Pham Duy",
      customerEmail: "duy.pham@email.com",
      pickupLocation: "Noi Bai Apt, Hanoi",
      pickupAt: "2023-11-25T08:00:00",
      dropoffAt: "2023-11-30T08:00:00",
      totalAmount: 12500000,
      status: "COMPLETED",
      createdAt: "2023-11-10T12:30:00",
    },
  ],
  totalPages: 1,
  totalElements: 4,
};

const mockBookingDetails = {
  1: {
    id: 1,
    bookingCode: "VLC-98210",
    status: "COMPLETED",
    pickupAt: "2023-11-12T09:00:00",
    dropoffAt: "2023-11-15T09:00:00",
    totalAmount: 4500000,
    createdAt: "2023-11-01T08:00:00",
    customer: {
      fullName: "Nguyen An",
      email: "an.nguyen@email.com",
      phone: "0901234567",
      avatar: "",
    },
    pickupLocation: {
      name: "Tan Son Nhat Apt",
      address: "Ho Chi Minh City",
    },
    dropoffLocation: {
      name: "Tan Son Nhat Apt",
      address: "Ho Chi Minh City",
    },
    items: [
      {
        vehicleName: "Toyota Camry 2.5Q",
        pricePerDay: 1500000,
        quantity: 3,
        subtotal: 4500000,
      },
    ],
    payment: {
      amount: 4500000,
      method: "VNPay",
      status: "PAID",
      paidAt: "2023-11-01T08:30:00",
    },
    promotion: {
      code: "NOV10",
      discountAmount: 500000,
    },
  },
};

const mockCountStats = [
  { time: "2023-08", count: 280 },
  { time: "2023-09", count: 340 },
  { time: "2023-10", count: 401 },
  { time: "2023-11", count: 461 },
];

const mockRevenueStats = [
  { time: "2023-08", revenue: 96000000 },
  { time: "2023-09", revenue: 118000000 },
  { time: "2023-10", revenue: 110000000 },
  { time: "2023-11", revenue: 128800000 },
];

const mockStatusStats = [
  { status: "COMPLETED", count: 1200 },
  { status: "PENDING", count: 282 },
  { status: "CANCELLED", count: 84 },
];

const mockTopVehicles = [
  { vehicle: "Toyota Camry 2.5Q", count: 62 },
  { vehicle: "Mazda Mazda6 Premium", count: 51 },
  { vehicle: "Ford Everest Titanium", count: 43 },
  { vehicle: "Mercedes C300", count: 39 },
  { vehicle: "Kia Carnival", count: 34 },
];

const emptyPage = {
  content: [],
  totalPages: 0,
  totalElements: 0,
};

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Cancelled", value: "CANCELLED" },
];

const buildPagination = (currentPage, totalPages) => {
  if (totalPages <= 1) return [];

  const pages = new Set([
    0,
    totalPages - 1,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  return [...pages]
    .filter((page) => page >= 0 && page < totalPages)
    .sort((a, b) => a - b);
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateRange = (pickupAt, dropoffAt) => {
  if (!pickupAt || !dropoffAt) {
    return {
      main: "--",
      secondary: "--",
      days: "--",
    };
  }

  const start = new Date(pickupAt);
  const end = new Date(dropoffAt);
  const diffDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return {
    main: new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
    }).format(start),
    secondary: new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
    }).format(end),
    days: `${diffDays} Day${diffDays > 1 ? "s" : ""}`,
  };
};

const normalizeStatus = (status) => (status || "UNKNOWN").toUpperCase();

const BookingManagementPage = () => {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [bookingsPage, setBookingsPage] = useState(emptyPage);
  const [countStats, setCountStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [email, setEmail] = useState("");
  const [locationId, setLocationId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [detailBooking, setDetailBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);

      const [countResult, revenueResult, statusResult, topResult] =
        await Promise.allSettled([
          getBookingCountStats({ groupBy: "month", fromDate, toDate }),
          getBookingRevenueStats({ groupBy: "month", fromDate, toDate }),
          getBookingStatusStats({ fromDate, toDate }),
          getTopBookedVehicles({ limit: 5 }),
        ]);

      const countFailed = countResult.status === "rejected";
      const revenueFailed = revenueResult.status === "rejected";
      const statusFailed = statusResult.status === "rejected";
      const topFailed = topResult.status === "rejected";

      setCountStats(countFailed ? mockCountStats : countResult.value || []);
      setRevenueStats(revenueFailed ? mockRevenueStats : revenueResult.value || []);
      setStatusStats(statusFailed ? mockStatusStats : statusResult.value || []);
      setTopVehicles(topFailed ? mockTopVehicles : topResult.value || []);

      if (countFailed || revenueFailed || statusFailed || topFailed) {
        setUsingFallback(true);
        setError(
          "Some booking analytics could not be loaded from the API. Demo data is being shown for unavailable sections.",
        );
      }

      setIsLoadingStats(false);
    };

    fetchStats();
  }, [fromDate, toDate]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoadingTable(true);

        const data = await getAdminBookings({
          status: selectedStatus,
          email,
          locationId,
          fromDate,
          toDate,
          page: page + 1,
          size: PAGE_SIZE,
        });

        setBookingsPage(data || emptyPage);
        setUsingFallback(false);
      } catch (fetchError) {
        setBookingsPage(mockBookingsPage);
        setUsingFallback(true);
        setError(
          fetchError.message ||
            "Booking data could not be loaded from the API. Demo data is being shown.",
        );
      } finally {
        setIsLoadingTable(false);
      }
    };

    fetchBookings();
  }, [selectedStatus, email, locationId, fromDate, toDate, page]);

  const dashboardCards = useMemo(() => {
    const totalBookings = countStats.reduce(
      (sum, item) => sum + Number(item.count || 0),
      0,
    );
    const totalRevenue = revenueStats.reduce(
      (sum, item) => sum + Number(item.revenue || 0),
      0,
    );
    const completed = statusStats.find(
      (item) => normalizeStatus(item.status) === "COMPLETED",
    )?.count || 0;
    const pending = statusStats.find(
      (item) => normalizeStatus(item.status) === "PENDING",
    )?.count || 0;

    return [
      {
        label: "Total Bookings",
        value: formatCurrency(totalBookings),
        caption: "+4.2% from last month",
        icon: "monitoring",
        tone: "green",
      },
      {
        label: "Total Revenue",
        value: formatCurrency(totalRevenue),
        suffix: "VND",
        caption: "Platform gross revenue",
        icon: "payments",
        tone: "green",
      },
      {
        label: "Completed",
        value: formatCurrency(completed),
        caption: "Successful rentals",
        icon: "check_circle",
        tone: "green",
      },
      {
        label: "Pending",
        value: formatCurrency(pending),
        caption: "Requires attention",
        icon: "more_horiz",
        tone: "amber",
      },
    ];
  }, [countStats, revenueStats, statusStats]);

  const startItem =
    bookingsPage.totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = Math.min(
    (page + 1) * PAGE_SIZE,
    bookingsPage.totalElements || 0,
  );
  const visiblePages = buildPagination(page, bookingsPage.totalPages || 0);

  const handleOpenDetail = async (bookingId) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailError("");

    try {
      const detail = await getAdminBookingDetail(bookingId);
      setDetailBooking(detail);
    } catch (fetchError) {
      setDetailBooking(mockBookingDetails[bookingId] || null);
      setDetailError(
        fetchError.message ||
          "Booking detail could not be loaded from the API. Showing demo detail if available.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="booking-management-page d-grid gap-4">
      <div>
        <h1 className="booking-page-title mb-2">Booking Management</h1>
        <p className="booking-page-subtitle mb-0">
          Monitor and manage all vehicle reservations across the platform.
        </p>
      </div>

      {error ? (
        <Alert variant={usingFallback ? "warning" : "danger"} className="mb-0">
          {error}
        </Alert>
      ) : null}

      <Row className="g-4">
        {dashboardCards.map((card) => (
          <Col key={card.label} md={6} xl={3}>
            <Card className={`booking-stat-card border-0 shadow-sm h-100 tone-${card.tone}`}>
              <Card.Body>
                <div className="booking-stat-head">
                  <div className="booking-stat-label">{card.label}</div>
                  <div className="booking-stat-icon">
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                </div>
                <div className="booking-stat-value">
                  {isLoadingStats ? <Spinner animation="border" size="sm" /> : card.value}
                </div>
                {card.suffix ? <div className="booking-stat-suffix">{card.suffix}</div> : null}
                <div className={`booking-stat-caption tone-${card.tone}`}>
                  {card.caption}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="booking-table-card border-0 shadow-sm overflow-hidden">
        <Card.Body className="booking-filter-shell">
          <div className="booking-status-tabs">
            {STATUS_TABS.map((tab) => {
              const isActive = selectedStatus === tab.value;

              return (
                <button
                  key={tab.label}
                  type="button"
                  className={`booking-status-tab ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setSelectedStatus(tab.value);
                    setPage(0);
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="booking-filter-row">
            <div className="booking-date-range-box">
              <span className="material-symbols-outlined">calendar_month</span>
              <Form.Control
                type="date"
                value={fromDate}
                max={toDate || todayIso}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(0);
                }}
              />
              <span className="booking-date-divider">to</span>
              <Form.Control
                type="date"
                value={toDate}
                min={fromDate || undefined}
                max={todayIso}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(0);
                }}
              />
              <span className="material-symbols-outlined">calendar_month</span>
            </div>

            <Button
              variant="light"
              className="booking-more-filters-btn"
              onClick={() => setShowFilters((current) => !current)}
            >
              <span className="material-symbols-outlined">filter_list</span>
              More Filters
            </Button>
          </div>

          {showFilters ? (
            <Row className="g-3 mt-1">
              <Col md={6} xl={4}>
                <Form.Control
                  value={email}
                  placeholder="Filter by customer email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setPage(0);
                  }}
                />
              </Col>
              <Col md={6} xl={4}>
                <Form.Control
                  value={locationId}
                  placeholder="Filter by location ID"
                  onChange={(event) => {
                    setLocationId(event.target.value);
                    setPage(0);
                  }}
                />
              </Col>
              <Col md={12} xl={4} className="d-flex justify-content-xl-end">
                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-4"
                  onClick={() => {
                    setEmail("");
                    setLocationId("");
                    setFromDate("");
                    setToDate("");
                    setSelectedStatus("");
                    setPage(0);
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          ) : null}
        </Card.Body>

        <div className="table-responsive">
          <Table className="align-middle mb-0 booking-management-table">
            <thead>
              <tr>
                <th>BOOKING CODE</th>
                <th>CUSTOMER</th>
                <th>LOCATION</th>
                <th>DATES</th>
                <th>TOTAL (VND)</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTable ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                  </td>
                </tr>
              ) : bookingsPage.content.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    No bookings found for the selected filters.
                  </td>
                </tr>
              ) : (
                bookingsPage.content.map((booking) => {
                  const dateInfo = formatDateRange(
                    booking.pickupAt,
                    booking.dropoffAt,
                  );
                  const normalizedStatus = normalizeStatus(booking.status);

                  return (
                    <tr key={booking.id}>
                      <td>
                        <div className="booking-code-cell">
                          #{booking.bookingCode || booking.id}
                        </div>
                      </td>
                      <td>
                        <div className="booking-customer-cell">
                          <div>
                            <div className="booking-customer-name">
                              {booking.customerName || "--"}
                            </div>
                            <div className="booking-customer-email">
                              {booking.customerEmail || "--"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="booking-location-name">
                          {booking.pickupLocation || "--"}
                        </div>
                      </td>
                      <td>
                        <div className="booking-date-main">
                          {dateInfo.main} - {dateInfo.secondary}
                        </div>
                        <div className="booking-date-days">{dateInfo.days}</div>
                      </td>
                      <td>
                        <div className="booking-total-value">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`booking-status-pill status-${normalizedStatus.toLowerCase()}`}
                        >
                          {normalizedStatus}
                        </span>
                      </td>
                      <td>
                        <div className="booking-actions">
                          <button
                            type="button"
                            className="booking-action-button"
                            onClick={() => handleOpenDetail(booking.id)}
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <Card.Body className="booking-table-footer">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div className="booking-records-text">
              Showing {startItem} - {endItem} of {formatCurrency(bookingsPage.totalElements)} results
            </div>

            <Pagination className="mb-0 booking-pagination">
              <Pagination.Prev
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
              />
              {visiblePages.map((pageNumber, index) => {
                const previous = visiblePages[index - 1];
                const needsEllipsis = index > 0 && previous !== pageNumber - 1;

                return (
                  <span key={pageNumber}>
                    {needsEllipsis ? <Pagination.Ellipsis disabled /> : null}
                    <Pagination.Item
                      active={pageNumber === page}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber + 1}
                    </Pagination.Item>
                  </span>
                );
              })}
              <Pagination.Next
                disabled={
                  page >= (bookingsPage.totalPages || 0) - 1 ||
                  (bookingsPage.totalPages || 0) === 0
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, (bookingsPage.totalPages || 1) - 1),
                  )
                }
              />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xl={12}>
          <Card className="booking-analytics-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="booking-section-heading">
                <h2>Top Booked Vehicles</h2>
                <p>Most requested vehicles</p>
              </div>
              <div className="booking-top-list">
                {topVehicles.map((vehicle) => (
                  <div key={vehicle.vehicle} className="booking-top-item">
                    <div className="booking-top-name">{vehicle.vehicle}</div>
                    <Badge bg="light" text="dark" pill>
                      {vehicle.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={isDetailOpen}
        onHide={() => {
          setIsDetailOpen(false);
          setDetailBooking(null);
          setDetailError("");
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Booking Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailError ? <Alert variant="warning">{detailError}</Alert> : null}
          {isDetailLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : !detailBooking ? (
            <div className="text-muted text-center py-4">
              Booking detail is unavailable.
            </div>
          ) : (
            <div className="booking-detail-grid">
              <Card className="border-0 bg-light-subtle">
                <Card.Body>
                  <div className="booking-detail-section-title">Booking Info</div>
                  <div className="booking-detail-field">
                    <strong>Booking Code:</strong> #{detailBooking.bookingCode || "--"}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Status:</strong> {detailBooking.status || "--"}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Created At:</strong> {formatDate(detailBooking.createdAt)}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Pickup:</strong> {formatDate(detailBooking.pickupAt)}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Dropoff:</strong> {formatDate(detailBooking.dropoffAt)}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Total:</strong> {formatCurrency(detailBooking.totalAmount)} VND
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 bg-light-subtle">
                <Card.Body>
                  <div className="booking-detail-section-title">Customer</div>
                  <div className="booking-detail-field">
                    <strong>Full Name:</strong> {detailBooking.customer?.fullName || "--"}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Email:</strong> {detailBooking.customer?.email || "--"}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Phone:</strong> {detailBooking.customer?.phone || "--"}
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 bg-light-subtle">
                <Card.Body>
                  <div className="booking-detail-section-title">Locations</div>
                  <div className="booking-detail-field">
                    <strong>Pickup:</strong> {detailBooking.pickupLocation?.name || "--"}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Pickup Address:</strong>{" "}
                    {detailBooking.pickupLocation?.address || "--"}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Dropoff:</strong> {detailBooking.dropoffLocation?.name || "--"}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Dropoff Address:</strong>{" "}
                    {detailBooking.dropoffLocation?.address || "--"}
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 bg-light-subtle">
                <Card.Body>
                  <div className="booking-detail-section-title">Payment</div>
                  <div className="booking-detail-field">
                    <strong>Method:</strong> {detailBooking.payment?.method || "--"}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Status:</strong> {detailBooking.payment?.status || "--"}
                  </div>
                  <div className="booking-detail-field">
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(detailBooking.payment?.amount)} VND
                  </div>
                  <div className="booking-detail-field">
                    <strong>Paid At:</strong> {formatDate(detailBooking.payment?.paidAt)}
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 bg-light-subtle booking-detail-wide">
                <Card.Body>
                  <div className="booking-detail-section-title">Booking Items</div>
                  <div className="booking-items-list">
                    {(detailBooking.items || []).map((item, index) => (
                      <div key={`${item.vehicleName}-${index}`} className="booking-item-row">
                        <div>
                          <div className="booking-item-name">
                            {item.vehicleName || "--"}
                          </div>
                          <div className="booking-item-meta">
                            Qty {item.quantity || 0} x {formatCurrency(item.pricePerDay)} VND
                          </div>
                        </div>
                        <div className="booking-item-subtotal">
                          {formatCurrency(item.subtotal)} VND
                        </div>
                      </div>
                    ))}
                  </div>

                  {detailBooking.promotion?.code ? (
                    <div className="booking-promotion-box">
                      Promotion `{detailBooking.promotion.code}`: -
                      {formatCurrency(detailBooking.promotion.discountAmount)} VND
                    </div>
                  ) : null}
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setIsDetailOpen(false);
              setDetailBooking(null);
              setDetailError("");
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingManagementPage;
