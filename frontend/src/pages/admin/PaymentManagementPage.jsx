import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  getAdminPayments,
  getMonthlyRevenue,
  getOwnerRevenue,
  getRevenueToday,
} from "../../services/admin/adminPaymentsService";
import "../../style/admin/PaymentManagement.css";

const PAGE_SIZE = 10;

const PAYMENT_STATUSES = ["PAID", "PENDING", "REFUND"];
const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const mockPayments = {
  content: [
    {
      id: 88219,
      bookingId: 324,
      userId: 8,
      customerName: "James Sullivan",
      customerEmail: "james@example.com",
      amount: 1240000,
      currency: "VND",
      provider: "Stripe",
      providerTxnId: "TXN-88219",
      status: "COMPLETED",
      createdAt: "2026-03-24T09:30:00Z",
    },
    {
      id: 88220,
      bookingId: 325,
      userId: 15,
      customerName: "Maria Alvarez",
      customerEmail: "maria@example.com",
      amount: 450500,
      currency: "VND",
      provider: "PayPal",
      providerTxnId: "TXN-88220",
      status: "PENDING",
      createdAt: "2026-03-24T08:10:00Z",
    },
    {
      id: 88221,
      bookingId: 326,
      userId: 18,
      customerName: "Robert Taylor",
      customerEmail: "robert@example.com",
      amount: 2100000,
      currency: "VND",
      provider: "VNPay",
      providerTxnId: "TXN-88221",
      status: "FAILED",
      createdAt: "2026-03-23T11:22:00Z",
    },
    {
      id: 88222,
      bookingId: 327,
      userId: 21,
      customerName: "Emma Watson",
      customerEmail: "emma@example.com",
      amount: 890000,
      currency: "VND",
      provider: "Apple Pay",
      providerTxnId: "TXN-88222",
      status: "COMPLETED",
      createdAt: "2026-03-23T06:40:00Z",
    },
  ],
  totalPages: 1,
  totalElements: 4,
};

const mockMonthlyRevenue = [
  { month: 1, revenue: 5200000 },
  { month: 2, revenue: 7400000 },
  { month: 3, revenue: 6890000 },
  { month: 4, revenue: 8120000 },
  { month: 5, revenue: 9350000 },
  { month: 6, revenue: 10400000 },
  { month: 7, revenue: 9800000 },
  { month: 8, revenue: 12600000 },
  { month: 9, revenue: 11200000 },
  { month: 10, revenue: 13800000 },
  { month: 11, revenue: 12500000 },
  { month: 12, revenue: 14900000 },
];

const mockOwnerRevenue = [
  {
    ownerId: 1,
    ownerName: "Minh Nguyen",
    ownerEmail: "minh.owner@example.com",
    revenue: 6100000,
  },
  {
    ownerId: 2,
    ownerName: "Lan Tran",
    ownerEmail: "lan.owner@example.com",
    revenue: 4200000,
  },
  {
    ownerId: 3,
    ownerName: "Duc Pham",
    ownerEmail: "duc.owner@example.com",
    revenue: 2700000,
  },
];

const mockRevenueToday = {
  date: "2026-03-24",
  revenue: 1690500,
};

const emptyPage = {
  content: [],
  totalPages: 0,
  totalElements: 0,
};

const formatCurrency = (value, currency = "VND") => {
  const numericValue = Number(value) || 0;

  try {
    return new Intl.NumberFormat(currency === "VND" ? "vi-VN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(numericValue);
  } catch {
    return new Intl.NumberFormat("vi-VN").format(numericValue);
  }
};

const formatCompactCurrency = (value, currency = "VND") => {
  const numericValue = Number(value) || 0;
  const base = new Intl.NumberFormat("vi-VN").format(numericValue);
  return currency ? `${base} ${currency}` : base;
};

const getStatValueLines = (value) => {
  const formattedValue = value || "--";
  const segments = formattedValue.split(" ");

  if (segments.length > 1 && segments.at(-1) === "VND") {
    return {
      primary: segments.slice(0, -1).join(" "),
      secondary: "VND",
    };
  }

  return {
    primary: formattedValue,
    secondary: "",
  };
};

const formatDateStack = (value) => {
  if (!value) return ["--", "--"];

  const date = new Date(value);

  return [
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date),
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
    }).format(date),
  ];
};

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value || 0);

const getInitials = (name) =>
  (name || "--")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const normalizeStatus = (status) => {
  const normalized = (status || "UNKNOWN").toUpperCase();

  if (["COMPLETED", "SUCCESS", "PAID"].includes(normalized)) {
    return "PAID";
  }

  if (["REFUND", "REFUNDED"].includes(normalized)) {
    return "REFUND";
  }

  if (normalized === "PENDING") {
    return "PENDING";
  }

  return normalized;
};

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

const PaymentManagementPage = () => {
  const currentYear = new Date().getFullYear();
  const todayIso = new Date().toISOString().slice(0, 10);

  const [paymentsPage, setPaymentsPage] = useState(emptyPage);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [ownerRevenue, setOwnerRevenue] = useState([]);
  const [todayRevenue, setTodayRevenue] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [providerTxnId, setProviderTxnId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [userId, setUserId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);

      const [monthlyResult, ownerResult, todayResult] = await Promise.allSettled([
        getMonthlyRevenue(currentYear),
        getOwnerRevenue(),
        getRevenueToday(),
      ]);

      const monthlyFailed = monthlyResult.status === "rejected";
      const ownerFailed = ownerResult.status === "rejected";
      const todayFailed = todayResult.status === "rejected";

      setMonthlyRevenue(
        monthlyFailed ? mockMonthlyRevenue : monthlyResult.value || [],
      );
      setOwnerRevenue(ownerFailed ? mockOwnerRevenue : ownerResult.value || []);
      setTodayRevenue(todayFailed ? mockRevenueToday : todayResult.value || null);

      if (monthlyFailed || ownerFailed || todayFailed) {
        setUsingFallback(true);
        setError(
          "Some payment analytics could not be loaded from the API. Demo data is being shown for the missing sections.",
        );
      }

      setIsLoadingMetrics(false);
    };

    fetchMetrics();
  }, [currentYear]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoadingTable(true);

        const data = await getAdminPayments({
          providerTxnId,
          provider: selectedProvider,
          status: selectedStatus,
          bookingId,
          userId,
          fromDate,
          toDate,
          page,
          size: PAGE_SIZE,
        });

        setPaymentsPage(data || emptyPage);
      } catch (fetchError) {
        setPaymentsPage(mockPayments);
        setUsingFallback(true);
        setError(
          fetchError.message ||
            "Payment transactions could not be loaded. Demo data is being shown.",
        );
      } finally {
        setIsLoadingTable(false);
      }
    };

    fetchPayments();
  }, [
    bookingId,
    fromDate,
    page,
    providerTxnId,
    selectedProvider,
    selectedStatus,
    toDate,
    userId,
  ]);

  const providerOptions = useMemo(() => {
    const providers = new Set(
      paymentsPage.content
        .map((payment) => payment.provider)
        .filter(Boolean)
        .map((provider) => provider.trim()),
    );

    return [...providers].sort((a, b) => a.localeCompare(b));
  }, [paymentsPage.content]);

  const monthlySeries = useMemo(() => {
    const merged = MONTH_LABELS.map((label, index) => {
      const record = monthlyRevenue.find((item) => Number(item.month) === index + 1);
      return {
        label,
        revenue: Number(record?.revenue) || 0,
      };
    });

    const maxRevenue = Math.max(...merged.map((item) => item.revenue), 1);

    return merged.map((item) => ({
      ...item,
      height: `${Math.max((item.revenue / maxRevenue) * 100, item.revenue ? 22 : 12)}%`,
    }));
  }, [monthlyRevenue]);

  const distribution = useMemo(() => {
    const totals = paymentsPage.content.reduce((accumulator, payment) => {
      const provider = payment.provider || "Other";
      accumulator[provider] =
        (accumulator[provider] || 0) + (Number(payment.amount) || 0);
      return accumulator;
    }, {});

    const totalAmount = Object.values(totals).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );

    return Object.entries(totals)
      .map(([provider, amount]) => ({
        provider,
        amount,
        percentage: totalAmount ? Math.round((amount / totalAmount) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [paymentsPage.content]);

  const dashboardCards = useMemo(() => {
    const totalRevenue = monthlyRevenue.reduce(
      (sum, item) => sum + (Number(item.revenue) || 0),
      0,
    );
    const currentMonthRevenue =
      monthlyRevenue.find(
        (item) => Number(item.month) === new Date().getMonth() + 1,
      )?.revenue || 0;
    const ownerPayouts = ownerRevenue.reduce(
      (sum, item) => sum + (Number(item.revenue) || 0),
      0,
    );
    const activePayments = paymentsPage.content.filter((payment) =>
      ["PENDING"].includes(normalizeStatus(payment.status)),
    ).length;

    return [
      {
        label: "Total Revenue",
        value: formatCompactCurrency(totalRevenue),
        badge: "+ Live",
        badgeTone: "success",
        icon: "account_balance_wallet",
        tone: "green",
      },
      {
        label: "Monthly Revenue",
        value: formatCompactCurrency(currentMonthRevenue),
        badge: `${new Date().toLocaleString("en-US", { month: "short" })}`,
        badgeTone: "success",
        icon: "calendar_month",
        tone: "mint",
      },
      {
        label: "Owner Payouts",
        value: formatCompactCurrency(ownerPayouts),
        badge:
          paymentsPage.content.some(
            (payment) => normalizeStatus(payment.status) === "PENDING",
          )
            ? "Pending"
            : "Settled",
        badgeTone: paymentsPage.content.some(
          (payment) => normalizeStatus(payment.status) === "PENDING",
        )
          ? "warning"
          : "success",
        icon: "trending_up",
        tone: "cyan",
      },
      {
        label: "Active Payments",
        value: formatNumber(activePayments),
        badge: "Today",
        badgeTone: "success",
        icon: "payments",
        tone: "lime",
      },
    ];
  }, [currentYear, monthlyRevenue, ownerRevenue, paymentsPage]);

  const startItem =
    paymentsPage.totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = Math.min(
    (page + 1) * PAGE_SIZE,
    paymentsPage.totalElements || 0,
  );
  const visiblePages = buildPagination(page, paymentsPage.totalPages || 0);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setPage(0);
  };

  const handleResetFilters = () => {
    setSelectedProvider("");
    setSelectedStatus("");
    setProviderTxnId("");
    setBookingId("");
    setUserId("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  return (
    <div className="payment-management-page d-grid gap-4">
      <div className="d-flex flex-column flex-xl-row justify-content-between gap-3 align-items-xl-center">
        <div>
          <h1 className="payment-page-title mb-2">Payment Management</h1>
          <p className="payment-page-subtitle mb-0">
            Manage transactions, track revenue, and monitor payment statuses.
          </p>
        </div>

        <Button
          variant="light"
          className="payment-filter-toggle"
          onClick={() => setShowFilters((current) => !current)}
        >
          <span className="material-symbols-outlined">filter_alt</span>
          Filter
        </Button>
      </div>

      {error && (
        <div
          className={`alert ${usingFallback ? "alert-warning" : "alert-danger"} mb-0`}
        >
          {error}
        </div>
      )}

      {showFilters && (
        <Card className="border-0 shadow-sm rounded-5 payment-panel">
          <Card.Body className="p-4">
            <Form onSubmit={handleFilterSubmit}>
              <Row className="g-3">
                <Col md={6} xl={3}>
                  <Form.Group>
                    <Form.Label className="payment-filter-label">
                      Transaction ID
                    </Form.Label>
                    <Form.Control
                      value={providerTxnId}
                      onChange={(event) => setProviderTxnId(event.target.value)}
                      placeholder="TXN-88219"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} xl={3}>
                  <Form.Group>
                    <Form.Label className="payment-filter-label">
                      Booking ID
                    </Form.Label>
                    <Form.Control
                      value={bookingId}
                      onChange={(event) => setBookingId(event.target.value)}
                      placeholder="324"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} xl={3}>
                  <Form.Group>
                    <Form.Label className="payment-filter-label">
                      User ID
                    </Form.Label>
                    <Form.Control
                      value={userId}
                      onChange={(event) => setUserId(event.target.value)}
                      placeholder="8"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} xl={3}>
                  <Form.Group>
                    <Form.Label className="payment-filter-label">
                      Provider
                    </Form.Label>
                    <Form.Select
                      value={selectedProvider}
                      onChange={(event) => setSelectedProvider(event.target.value)}
                    >
                      <option value="">All Providers</option>
                      {providerOptions.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} xl={3}>
                  <Form.Group>
                    <Form.Label className="payment-filter-label">
                      Status
                    </Form.Label>
                    <Form.Select
                      value={selectedStatus}
                      onChange={(event) => setSelectedStatus(event.target.value)}
                    >
                      <option value="">All Statuses</option>
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} xl={3}>
                  <Form.Group>
                    <Form.Label className="payment-filter-label">
                      From Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      max={toDate || todayIso}
                      onChange={(event) => setFromDate(event.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} xl={3}>
                  <Form.Group>
                    <Form.Label className="payment-filter-label">
                      To Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      min={fromDate || undefined}
                      max={todayIso}
                      onChange={(event) => setToDate(event.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col
                  md={6}
                  xl={3}
                  className="d-flex align-items-end justify-content-md-end"
                >
                  <div className="d-flex gap-2 w-100 justify-content-md-end">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="rounded-pill px-4"
                      onClick={handleResetFilters}
                    >
                      Reset
                    </Button>
                    <Button type="submit" className="btn-primary-custom rounded-pill px-4">
                      Apply
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Row className="g-4">
        {dashboardCards.map((card) => (
          <Col key={card.label} md={6} xl={3}>
            <Card className={`border-0 shadow-sm rounded-5 payment-stat-card tone-${card.tone}`}>
              <Card.Body className="p-4 payment-stat-card-body">
                {(() => {
                  const valueLines = getStatValueLines(card.value);

                  return (
                    <>
                <div className="d-flex justify-content-between align-items-start gap-3 payment-stat-card-top">
                  <div className="payment-stat-icon">
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                  <Badge className={`payment-stat-badge badge-${card.badgeTone || "success"}`}>
                    {card.badge}
                  </Badge>
                </div>

                <div className="payment-stat-label">{card.label}</div>
                <div className="payment-stat-value">
                  {isLoadingMetrics ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      <span className="payment-stat-value-primary">
                        {valueLines.primary}
                      </span>
                      {valueLines.secondary ? (
                        <span className="payment-stat-value-secondary">
                          {valueLines.secondary}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
                    </>
                  );
                })()}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm rounded-5 overflow-hidden payment-panel">
        <Card.Body className="p-4 p-xl-5 border-bottom">
          <div className="d-flex flex-column flex-xl-row justify-content-between gap-3 align-items-xl-center">
            <div>
              <h2 className="payment-section-title mb-1">Recent Transactions</h2>
              <p className="payment-section-subtitle mb-0">
                Real-time update from all payment gateways
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Form.Select
                className="payment-inline-select"
                value={selectedProvider}
                onChange={(event) => {
                  setSelectedProvider(event.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Providers</option>
                {providerOptions.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </Form.Select>

              <Form.Select
                className="payment-inline-select"
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Statuses</option>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </Card.Body>

        <div className="table-responsive">
          <Table className="align-middle mb-0 payment-transactions-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTable ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                  </td>
                </tr>
              ) : paymentsPage.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    No payments found for the selected filters.
                  </td>
                </tr>
              ) : (
                paymentsPage.content.map((payment) => {
                  const [dateMain, dateYear] = formatDateStack(payment.createdAt);
                  const normalizedStatus = normalizeStatus(payment.status);

                  return (
                    <tr key={payment.id}>
                      <td>
                        <div className="payment-transaction-id">
                          #{payment.providerTxnId || payment.id}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="payment-customer-name">
                            {payment.customerName || "--"}
                          </div>
                          <div className="payment-customer-email">
                            {payment.customerEmail || "--"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="payment-amount-primary">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="payment-provider-icon">
                            {(payment.provider || "?").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="payment-provider-name">
                            {payment.provider || "--"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`payment-status-text status-${normalizedStatus.toLowerCase()}`}
                        >
                          {normalizedStatus}
                        </span>
                      </td>
                      <td>
                        <div className="payment-date-main">{dateMain}</div>
                        <div className="payment-date-year">{dateYear}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <Card.Body className="p-4 p-xl-5 border-top bg-light-subtle">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div className="payment-records-text">
              Showing {startItem} to {endItem} of {formatNumber(paymentsPage.totalElements)} records
            </div>

            <Pagination className="mb-0 payment-pagination">
              <Pagination.Prev
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
              />
              {visiblePages.map((pageNumber, index) => {
                const previous = visiblePages[index - 1];
                const needsEllipsis = index > 0 && previous !== pageNumber - 1;

                return (
                  <span key={pageNumber}>
                    {needsEllipsis && <Pagination.Ellipsis disabled />}
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
                  page >= (paymentsPage.totalPages || 0) - 1 ||
                  (paymentsPage.totalPages || 0) === 0
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, (paymentsPage.totalPages || 1) - 1),
                  )
                }
              />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xl={8}>
          <Card className="border-0 shadow-sm rounded-5 h-100 payment-panel">
            <Card.Body className="p-4 p-xl-5">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <h2 className="payment-section-title mb-1">Revenue Trends</h2>
                  <p className="payment-section-subtitle mb-0">
                    Monthly growth analysis
                  </p>
                </div>

                <div className="payment-range-tabs">
                  <span className="active">12M</span>
                  <span>6M</span>
                  <span>30D</span>
                </div>
              </div>

              <div className="payment-chart-shell">
                {isLoadingMetrics ? (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <Spinner animation="border" variant="success" />
                  </div>
                ) : (
                  <div className="payment-chart-bars">
                    {monthlySeries.map((item) => (
                      <div key={item.label} className="payment-chart-bar-column">
                        <div className="payment-chart-value">
                          {item.revenue > 0
                            ? `${Math.round(item.revenue / 1000000)}M`
                            : ""}
                        </div>
                        <div className="payment-chart-bar-track">
                          <div
                            className="payment-chart-bar"
                            style={{ height: item.height }}
                          />
                          <div
                            className="payment-chart-bar payment-chart-bar-muted"
                            style={{ height: `calc(${item.height} + 14%)` }}
                          />
                        </div>
                        <div className="payment-chart-label">{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="border-0 shadow-sm rounded-5 h-100 payment-panel">
            <Card.Body className="p-4 p-xl-5 d-flex flex-column">
              <div>
                <h2 className="payment-section-title mb-1">Payment Distribution</h2>
              </div>

              <div className="d-grid gap-4 mt-5">
                {distribution.length === 0 ? (
                  <div className="text-muted">No provider data available.</div>
                ) : (
                  distribution.map((item) => (
                    <div key={item.provider}>
                      <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
                        <div className="payment-provider-stat">{item.provider}</div>
                        <div className="payment-provider-percent">
                          {item.percentage}%
                        </div>
                      </div>
                      <div className="payment-distribution-track">
                        <div
                          className="payment-distribution-fill"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="payment-distribution-footer mt-auto">
                Data updated as of{" "}
                {todayRevenue?.date
                  ? new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(todayRevenue.date))
                  : "today"}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentManagementPage;
