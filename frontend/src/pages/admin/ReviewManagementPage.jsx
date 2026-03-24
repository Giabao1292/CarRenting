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
  deleteAdminReview,
  getAdminReviewDetail,
  getAdminReviews,
} from "../../services/admin/adminReviewsService";
import "../../style/admin/ReviewManagement.css";

const PAGE_SIZE = 10;

const mockReviewsPage = {
  content: [
    {
      id: 1,
      rating: 5,
      comment:
        "Absolutely seamless experience. The vehicle was spotless and pickup was quick.",
      createdAt: "2023-10-24T08:15:00Z",
      userId: 101,
      userName: "John Doe",
      userEmail: "john.doe@email.com",
      vehicleId: 301,
      vehicleName: "Tesla Model 3",
    },
    {
      id: 2,
      rating: 4,
      comment:
        "The pickup location was a little hard to find, but the car quality was excellent.",
      createdAt: "2023-10-23T10:30:00Z",
      userId: 102,
      userName: "Sarah Adams",
      userEmail: "s.adams@web.com",
      vehicleId: 302,
      vehicleName: "BMW X5",
    },
    {
      id: 3,
      rating: 5,
      comment:
        "Great engine sound. Had a blast driving it for the weekend trip.",
      createdAt: "2023-10-23T12:45:00Z",
      userId: 103,
      userName: "Mike K.",
      userEmail: "mike88@gmail.com",
      vehicleId: 303,
      vehicleName: "Ford Mustang",
    },
  ],
  totalPages: 1,
  totalElements: 3,
  number: 0,
  size: 10,
};

const mockReviewDetails = {
  1: {
    id: 1,
    rating: 5,
    comment:
      "Absolutely seamless experience. The vehicle was spotless and pickup was quick.",
    createdAt: "2023-10-24T08:15:00Z",
    bookingId: 4001,
    userId: 101,
    userName: "John Doe",
    userEmail: "john.doe@email.com",
    userPhone: "0901234567",
    vehicleId: 301,
    vehicleBrand: "Tesla",
    vehicleModel: "Model 3",
    licensePlate: "51A-888.99",
  },
  2: {
    id: 2,
    rating: 4,
    comment:
      "The pickup location was a little hard to find, but the car quality was excellent.",
    createdAt: "2023-10-23T10:30:00Z",
    bookingId: 4002,
    userId: 102,
    userName: "Sarah Adams",
    userEmail: "s.adams@web.com",
    userPhone: "0902345678",
    vehicleId: 302,
    vehicleBrand: "BMW",
    vehicleModel: "X5",
    licensePlate: "30G-123.45",
  },
  3: {
    id: 3,
    rating: 5,
    comment:
      "Great engine sound. Had a blast driving it for the weekend trip.",
    createdAt: "2023-10-23T12:45:00Z",
    bookingId: 4003,
    userId: 103,
    userName: "Mike K.",
    userEmail: "mike88@gmail.com",
    userPhone: "0903456789",
    vehicleId: 303,
    vehicleBrand: "Ford",
    vehicleModel: "Mustang",
    licensePlate: "59C-456.78",
  },
};

const emptyPage = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: PAGE_SIZE,
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

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value || 0);

const formatDate = (value) => {
  if (!value) return "--";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
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

const truncateText = (value, maxLength = 46) => {
  if (!value) return "--";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
};

const renderStars = (rating, className = "") => (
  <div className={`review-stars ${className}`.trim()}>
    {Array.from({ length: 5 }, (_, index) => (
      <span
        key={`${rating}-${index}`}
        className={`material-symbols-outlined ${
          index < Number(rating || 0) ? "filled" : ""
        }`}
      >
        star
      </span>
    ))}
  </div>
);

const ReviewManagementPage = () => {
  const [reviewsPage, setReviewsPage] = useState(emptyPage);
  const [page, setPage] = useState(0);
  const [selectedRating, setSelectedRating] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [detailReview, setDetailReview] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDeleteReview, setPendingDeleteReview] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getAdminReviews({
          page,
          size: PAGE_SIZE,
          rating: selectedRating,
        });

        if (!isMounted) return;

        setReviewsPage(data || emptyPage);
        setUsingFallback(false);
      } catch (fetchError) {
        if (!isMounted) return;

        setReviewsPage(mockReviewsPage);
        setUsingFallback(true);
        setError(
          fetchError.message ||
            "Reviews could not be loaded from the API. Demo data is being shown.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [page, selectedRating]);

  const filteredReviews = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return reviewsPage.content || [];
    }

    return (reviewsPage.content || []).filter((review) => {
      const customerName = (review.userName || "").toLowerCase();
      const vehicleName = (review.vehicleName || "").toLowerCase();

      return (
        customerName.includes(normalizedKeyword) ||
        vehicleName.includes(normalizedKeyword)
      );
    });
  }, [reviewsPage.content, searchKeyword]);

  const reviewStats = useMemo(() => {
    const reviews = filteredReviews;
    const total = reviewsPage.totalElements || reviews.length;
    const average =
      reviews.length > 0
        ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          reviews.length
        : 0;
    const positive = reviews.filter((item) => Number(item.rating) >= 4).length;
    const lowRated = reviews.filter((item) => Number(item.rating) <= 2).length;
    const resolutionRate = reviews.length
      ? Math.round((positive / reviews.length) * 100)
      : 0;

    return {
      total,
      average,
      positive,
      lowRated,
      resolutionRate,
    };
  }, [filteredReviews, reviewsPage.totalElements]);

  const startItem =
    filteredReviews.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = startItem === 0 ? 0 : startItem + filteredReviews.length - 1;
  const visiblePages = buildPagination(page, reviewsPage.totalPages || 0);

  const ratingChips = [
    { label: "All", value: "" },
    { label: "5", value: 5 },
    { label: "4", value: 4 },
    { label: "3", value: 3 },
    { label: "Low", value: 2 },
  ];

  const handleOpenDetail = async (reviewId) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailError("");

    try {
      const detail = await getAdminReviewDetail(reviewId);
      setDetailReview(detail);
    } catch (fetchError) {
      setDetailReview(mockReviewDetails[reviewId] || null);
      setDetailError(
        fetchError.message ||
          "Review detail could not be loaded from the API. Showing demo detail if available.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteReview?.id) return;

    const reviewId = pendingDeleteReview.id;

    try {
      setDeletingId(reviewId);
      await deleteAdminReview(reviewId);

      const remainingItems = (reviewsPage.content || []).filter(
        (review) => review.id !== reviewId,
      );
      const shouldMoveToPreviousPage =
        remainingItems.length === 0 && page > 0;

      if (shouldMoveToPreviousPage) {
        setPage((current) => Math.max(current - 1, 0));
        return;
      }

      const data = await getAdminReviews({
        page,
        size: PAGE_SIZE,
        rating: selectedRating,
      });

      setReviewsPage(data || emptyPage);
      setUsingFallback(false);
      setError("");
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this review.");
    } finally {
      setDeletingId(null);
      setPendingDeleteReview(null);
    }
  };

  return (
    <div className="review-management-page d-grid gap-4">
      <section className="review-hero-card">
        <div className="review-hero-copy">
          <div className="review-hero-title-row">
            <div className="review-hero-icon">
              <span className="material-symbols-outlined">monitoring</span>
            </div>
            <div>
              <h1 className="review-page-title mb-2">Review Management</h1>
              <p className="review-page-subtitle mb-0">
                Manage and moderate customer feedback for your fleet.
              </p>
            </div>
          </div>
        </div>

        <div className="review-hero-stats">
          <Card className="review-summary-card shadow-sm border-0">
            <Card.Body>
              <div className="review-summary-label">AVG. RATING</div>
              <div className="review-summary-value-row">
                <div className="review-summary-value">
                  {reviewStats.average.toFixed(1)}
                </div>
                {renderStars(Math.round(reviewStats.average), "review-summary-stars")}
              </div>
            </Card.Body>
          </Card>

          <Card className="review-summary-card shadow-sm border-0">
            <Card.Body>
              <div className="review-summary-label">RESOLUTION RATE</div>
              <div className="review-summary-trend">
                {reviewStats.resolutionRate}%
                <span className="material-symbols-outlined">trending_up</span>
              </div>
            </Card.Body>
          </Card>
        </div>
      </section>

      {error ? (
        <Alert variant={usingFallback ? "warning" : "danger"} className="mb-0">
          {error}
        </Alert>
      ) : null}

      <Card className="review-filter-panel border-0 shadow-sm">
        <Card.Body className="p-4 p-xl-4">
          <Row className="g-3 align-items-center">
            <Col xl={7}>
              <div className="review-filter-label mb-3">FILTER BY RATING</div>
              <div className="review-rating-chip-row">
                {ratingChips.map((chip) => {
                  const isActive = String(selectedRating) === String(chip.value);

                  return (
                    <button
                      key={chip.label}
                      type="button"
                      className={`review-chip ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setSelectedRating(chip.value);
                        setPage(0);
                      }}
                    >
                      <span>{chip.label}</span>
                      {chip.label !== "All" ? (
                        <span className="material-symbols-outlined">
                          {chip.label === "Low" ? "south_east" : "star"}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </Col>

            <Col xl={5}>
              <div className="review-filter-actions">
                <Form.Control
                  value={searchKeyword}
                  onChange={(event) => {
                    setSearchKeyword(event.target.value);
                  }}
                  placeholder="Filter by customer or vehicle name"
                  className="review-vehicle-input"
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col md={6} xl={3}>
          <Card className="review-stat-box border-0 shadow-sm h-100">
            <Card.Body>
              <div className="review-stat-head">
                <div className="review-stat-icon positive">
                  <span className="material-symbols-outlined">sentiment_satisfied</span>
                </div>
                <Badge bg="light" text="success" className="review-stat-change positive">
                  +2.4%
                </Badge>
              </div>
              <div className="review-stat-number">
                {formatNumber(reviewStats.positive)}
              </div>
              <div className="review-stat-text">Positive Reviews</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="review-stat-box border-0 shadow-sm h-100">
            <Card.Body>
              <div className="review-stat-head">
                <div className="review-stat-icon negative">
                  <span className="material-symbols-outlined">sentiment_dissatisfied</span>
                </div>
                <Badge bg="light" text="danger" className="review-stat-change negative">
                  -12%
                </Badge>
              </div>
              <div className="review-stat-number">
                {formatNumber(reviewStats.lowRated)}
              </div>
              <div className="review-stat-text">Pending Complaints</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="review-tip-box border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column justify-content-center">
              <div className="review-tip-label">Pro Tip</div>
              <div className="review-tip-copy">
                Respond to 1-star reviews within 2 hours to improve retention.
              </div>
              <div className="review-tip-watermark">
                <span className="material-symbols-outlined">social_leaderboard</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="review-table-card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table className="align-middle mb-0 review-management-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>VEHICLE</th>
                <th>RATING</th>
                <th>COMMENT</th>
                <th>DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    No reviews found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => {
                  const [dateMain, dateYear] = formatDateStack(review.createdAt);

                  return (
                    <tr key={review.id}>
                      <td>
                        <div className="review-customer-name">
                          {review.userName || "--"}
                        </div>
                        <div className="review-customer-email">
                          {review.userEmail || "--"}
                        </div>
                      </td>
                      <td>
                        <div className="review-vehicle-name">
                          {review.vehicleName || "--"}
                        </div>
                      </td>
                      <td>{renderStars(review.rating)}</td>
                      <td>
                        <div className="review-comment-preview">
                          {truncateText(review.comment)}
                        </div>
                      </td>
                      <td>
                        <div className="review-date-main">{dateMain},</div>
                        <div className="review-date-year">{dateYear}</div>
                      </td>
                      <td>
                        <div className="review-actions">
                          <button
                            type="button"
                            className="review-action-icon detail"
                            onClick={() => handleOpenDetail(review.id)}
                            aria-label={`View review ${review.id}`}
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button
                            type="button"
                            className="review-action-icon delete"
                            onClick={() => setPendingDeleteReview(review)}
                            disabled={deletingId === review.id}
                            aria-label={`Delete review ${review.id}`}
                          >
                            {deletingId === review.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <span className="material-symbols-outlined">delete</span>
                            )}
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

        <Card.Body className="review-table-footer">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div className="review-records-text">
              Showing {startItem} to {endItem} of{" "}
              {formatNumber(searchKeyword.trim() ? filteredReviews.length : reviewsPage.totalElements)}{" "}
              entries
            </div>

            <Pagination className="mb-0 review-pagination">
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
                  page >= (reviewsPage.totalPages || 0) - 1 ||
                  (reviewsPage.totalPages || 0) === 0
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, (reviewsPage.totalPages || 1) - 1),
                  )
                }
              />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={Boolean(pendingDeleteReview)}
        onHide={() => {
          if (!deletingId) {
            setPendingDeleteReview(null);
          }
        }}
        centered
      >
        <Modal.Header closeButton className="review-detail-header">
          <Modal.Title>Delete Review</Modal.Title>
        </Modal.Header>
        <Modal.Body className="review-detail-body pt-2">
          <p className="mb-2">
            Are you sure you want to delete this review?
          </p>
          {pendingDeleteReview ? (
            <div className="text-muted small">
              Review #{pendingDeleteReview.id} - {pendingDeleteReview.userName || "--"}
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="review-detail-footer">
          <Button
            variant="outline-secondary"
            onClick={() => setPendingDeleteReview(null)}
            disabled={Boolean(deletingId)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={Boolean(deletingId)}
          >
            {deletingId ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "OK"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isDetailOpen}
        onHide={() => {
          setIsDetailOpen(false);
          setDetailReview(null);
          setDetailError("");
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="review-detail-header">
          <Modal.Title>Review Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body className="review-detail-body">
          {detailError ? <Alert variant="warning">{detailError}</Alert> : null}

          {isDetailLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : !detailReview ? (
            <div className="text-center text-muted py-4">
              Review detail is unavailable.
            </div>
          ) : (
            <div className="review-detail-grid">
              <div className="review-detail-section">
                <div className="review-detail-section-title">Review Info</div>
                <div className="review-detail-field-grid">
                  <Form.Group>
                    <Form.Label>Rating</Form.Label>
                    <div className="review-detail-stars-shell">
                      {renderStars(detailReview.rating, "review-detail-stars")}
                    </div>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Created At</Form.Label>
                    <Form.Control
                      value={formatDate(detailReview.createdAt)}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="review-detail-full">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={detailReview.comment || ""}
                      readOnly
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="review-detail-section">
                <div className="review-detail-section-title">Customer Info</div>
                <div className="review-detail-field-grid">
                  <Form.Group>
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control value={detailReview.userName || ""} readOnly />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={detailReview.userEmail || ""} readOnly />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control value={detailReview.userPhone || ""} readOnly />
                  </Form.Group>
                </div>
              </div>

              <div className="review-detail-section">
                <div className="review-detail-section-title">Vehicle Info</div>
                <div className="review-detail-field-grid">
                  <Form.Group>
                    <Form.Label>Brand</Form.Label>
                    <Form.Control value={detailReview.vehicleBrand || ""} readOnly />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Model</Form.Label>
                    <Form.Control value={detailReview.vehicleModel || ""} readOnly />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>License Plate</Form.Label>
                    <Form.Control
                      value={detailReview.licensePlate || ""}
                      readOnly
                    />
                  </Form.Group>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="review-detail-footer">
          <Button
            variant="outline-secondary"
            onClick={() => {
              setIsDetailOpen(false);
              setDetailReview(null);
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

export default ReviewManagementPage;
