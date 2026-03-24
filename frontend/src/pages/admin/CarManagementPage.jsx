import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  Modal,
  Pagination,
  Spinner,
} from "react-bootstrap";
import {
  approveAdminCar,
  getAdminCarDetail,
  getAdminCars,
  getAdminCarSummary,
  getAdminPendingCars,
  rejectAdminCar,
  removeAdminCar,
} from "../../services/admin/adminCarsService";
import "../../style/admin/CarManagement.css";

const PAGE_SIZE = 4;

const emptyPage = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: PAGE_SIZE,
};

const emptySummary = {
  totalCars: 0,
  availableCars: 0,
  rejectedCars: 0,
  unavailableCars: 0,
};

const mockCarsPage = {
  content: [
    {
      id: 7721,
      thumbnail:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=320&q=80",
      licensePlate: "51G-123.45",
      brand: "Mercedes-Benz",
      model: "S-Class",
      pricePerDay: 4500000,
      status: "AVAILABLE",
    },
    {
      id: 4492,
      thumbnail:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=320&q=80",
      licensePlate: "30H-888.88",
      brand: "BMW",
      model: "X7",
      pricePerDay: 5200000,
      status: "PENDING",
    },
    {
      id: 3105,
      thumbnail: "",
      licensePlate: "51L-002.91",
      brand: "VinFast",
      model: "VF9",
      pricePerDay: 3800000,
      status: "REJECTED",
    },
    {
      id: 9901,
      thumbnail:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=320&q=80",
      licensePlate: "51A-999.11",
      brand: "Porsche",
      model: "911 Carrera",
      pricePerDay: 8500000,
      status: "AVAILABLE",
    },
  ],
  totalPages: 3,
  totalElements: 1284,
  number: 0,
  size: PAGE_SIZE,
};

const mockPendingPage = {
  ...mockCarsPage,
  content: mockCarsPage.content.filter((car) => car.status === "PENDING"),
  totalPages: 4,
  totalElements: 14,
};

const mockSummary = {
  totalCars: 1284,
  availableCars: 1052,
  rejectedCars: 12,
  unavailableCars: 220,
};

const mockCarDetails = {
  7721: {
    id: 7721,
    licensePlate: "51G-123.45",
    brand: "Mercedes-Benz",
    model: "S-Class",
    year: 2023,
    color: "Black",
    pricePerDay: 4500000,
    status: "AVAILABLE",
    rejectionReason: null,
    ownerId: 18,
    ownerName: "Minh Nguyen",
    ownerEmail: "minh.owner@example.com",
    vehicleTypeId: 1,
    vehicleTypeName: "Luxury Sedan",
    locationId: 4,
    locationName: "District 1",
    locationAddress: "Le Loi Boulevard, Ho Chi Minh City",
    images: [mockCarsPage.content[0].thumbnail],
    createdAt: "2026-03-10T08:30:00",
    updatedAt: "2026-03-22T10:00:00",
  },
  4492: {
    id: 4492,
    licensePlate: "30H-888.88",
    brand: "BMW",
    model: "X7",
    year: 2024,
    color: "Dark Grey",
    pricePerDay: 5200000,
    status: "PENDING",
    rejectionReason: null,
    ownerId: 21,
    ownerName: "Lan Tran",
    ownerEmail: "lan.owner@example.com",
    vehicleTypeId: 2,
    vehicleTypeName: "Luxury SUV",
    locationId: 3,
    locationName: "Cau Giay",
    locationAddress: "Hanoi, Vietnam",
    images: [mockCarsPage.content[1].thumbnail],
    createdAt: "2026-03-21T09:10:00",
    updatedAt: "2026-03-23T15:45:00",
  },
  3105: {
    id: 3105,
    licensePlate: "51L-002.91",
    brand: "VinFast",
    model: "VF9",
    year: 2023,
    color: "Silver",
    pricePerDay: 3800000,
    status: "REJECTED",
    rejectionReason: "Vehicle documents are incomplete.",
    ownerId: 11,
    ownerName: "Duc Pham",
    ownerEmail: "duc.owner@example.com",
    vehicleTypeId: 5,
    vehicleTypeName: "Electric SUV",
    locationId: 6,
    locationName: "Thu Duc",
    locationAddress: "Ho Chi Minh City, Vietnam",
    images: [],
    createdAt: "2026-03-18T07:25:00",
    updatedAt: "2026-03-20T16:12:00",
  },
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

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

const formatCurrency = (value) =>
  `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  )} VND`;

const formatDateTime = (value) => {
  if (!value) return "--";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const normalizeStatus = (status) => (status || "UNKNOWN").toUpperCase();

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "AVAILABLE") return "Available";
  if (normalized === "PENDING") return "Pending";
  if (normalized === "REJECTED") return "Rejected";
  if (["UNAVAILABLE", "RENTED", "BOOKED"].includes(normalized)) {
    return "Unavailable";
  }
  if (normalized === "REMOVED") return "Removed";

  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
};

const getVehicleLabel = (car) =>
  [car.brand, car.model].filter(Boolean).join(" ") || "Unnamed vehicle";

const getFallbackPage = (tab) => (tab === "pending" ? mockPendingPage : mockCarsPage);

const CarManagementPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [summary, setSummary] = useState(emptySummary);
  const [carsPage, setCarsPage] = useState(emptyPage);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [actionError, setActionError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");

  const loadSummary = async () => {
    setIsLoadingSummary(true);

    const [summaryResult, pendingResult] = await Promise.allSettled([
      getAdminCarSummary(),
      getAdminPendingCars({ page: 0, size: 1 }),
    ]);

    if (summaryResult.status === "fulfilled") {
      setSummary(summaryResult.value || emptySummary);
    } else {
      setSummary(mockSummary);
      setError(
        summaryResult.reason?.message ||
          "Car summary could not be loaded from the API. Demo data is being shown.",
      );
      setUsingFallback(true);
    }

    if (pendingResult.status === "fulfilled") {
      setPendingCount(pendingResult.value?.totalElements || 0);
    } else {
      setPendingCount(mockPendingPage.totalElements);
      setUsingFallback(true);
    }

    setIsLoadingSummary(false);
  };

  const loadCars = async (currentTab, currentPage) => {
    try {
      setIsLoadingCars(true);
      setError("");

      const data =
        currentTab === "pending"
          ? await getAdminPendingCars({ page: currentPage, size: PAGE_SIZE })
          : await getAdminCars({ page: currentPage, size: PAGE_SIZE });

      setCarsPage(data || emptyPage);
      setUsingFallback(false);
    } catch (fetchError) {
      setCarsPage(getFallbackPage(currentTab));
      setError(
        fetchError.message ||
          "Cars could not be loaded from the API. Demo data is being shown.",
      );
      setUsingFallback(true);
    } finally {
      setIsLoadingCars(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadCars(activeTab, page);
  }, [activeTab, page]);

  const startItem =
    (carsPage.totalElements || 0) === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem =
    startItem === 0
      ? 0
      : startItem + Math.max((carsPage.content || []).length - 1, 0);
  const visiblePages = buildPagination(page, carsPage.totalPages || 0);

  const availableRate = useMemo(() => {
    if (!summary.totalCars) return 0;
    return Math.round((summary.availableCars / summary.totalCars) * 100);
  }, [summary.availableCars, summary.totalCars]);

  const selectedCarStatus = normalizeStatus(selectedCar?.status);
  const isPendingSelectedCar = selectedCarStatus === "PENDING";

  const statCards = [
    {
      label: "Total Cars",
      value: formatNumber(summary.totalCars),
      badge: `${formatNumber(pendingCount)} pending`,
      icon: "inventory_2",
      tone: "green",
    },
    {
      label: "Available Cars",
      value: formatNumber(summary.availableCars),
      badge: `${availableRate}% of fleet`,
      icon: "task_alt",
      tone: "cyan",
    },
    {
      label: "Rejected Cars",
      value: formatNumber(summary.rejectedCars),
      badge: "Review required",
      icon: "error",
      tone: "rose",
    },
    {
      label: "Unavailable Today",
      value: formatNumber(summary.unavailableCars),
      badge: "Active rentals",
      icon: "history",
      tone: "slate",
    },
  ];

  const handleOpenDetail = async (carId) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailError("");
    setActionError("");
    setRejectReason("");
    setRejectReasonError("");

    try {
      const detail = await getAdminCarDetail(carId);
      setSelectedCar(detail);
    } catch (fetchError) {
      setSelectedCar(mockCarDetails[carId] || null);
      setDetailError(
        fetchError.message ||
          "Car detail could not be loaded from the API. Showing demo detail if available.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const refreshAfterAction = async () => {
    await Promise.all([loadSummary(), loadCars(activeTab, page)]);
  };

  const handleApprove = async () => {
    if (!selectedCar?.id) return;

    try {
      setIsSubmittingAction(true);
      setActionError("");
      await approveAdminCar(selectedCar.id);
      const nextStatus = "AVAILABLE";
      setSelectedCar((current) =>
        current ? { ...current, status: nextStatus, rejectionReason: null } : current,
      );
      await refreshAfterAction();
      return true;
    } catch (submitError) {
      setActionError(submitError.message || "Unable to approve this car.");
      return false;
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCar?.id) return;
    const trimmedReason = rejectReason.trim();

    if (!trimmedReason) {
      setRejectReasonError("Rejection reason is required.");
      setActionError("");
      return false;
    }

    try {
      setIsSubmittingAction(true);
      setActionError("");
      setRejectReasonError("");
      await rejectAdminCar(selectedCar.id, trimmedReason);
      setSelectedCar((current) =>
        current
          ? { ...current, status: "REJECTED", rejectionReason: trimmedReason }
          : current,
      );
      await refreshAfterAction();
      return true;
    } catch (submitError) {
      setActionError(submitError.message || "Unable to reject this car.");
      return false;
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedCar?.id) return;

    try {
      setIsSubmittingAction(true);
      setActionError("");
      await removeAdminCar(selectedCar.id);
      setIsDetailOpen(false);
      await refreshAfterAction();
      return true;
    } catch (submitError) {
      setActionError(submitError.message || "Unable to remove this car.");
      return false;
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "approve") {
      return handleApprove();
    }

    if (confirmAction === "reject") {
      return handleReject();
    }

    if (confirmAction === "remove") {
      return handleRemove();
    }

    return false;
  };

  const getConfirmContent = () => {
    if (confirmAction === "approve") {
      return {
        title: "Approve Car",
        body: "Are you sure you want to approve this car?",
        buttonText: "Yes, Approve",
        buttonVariant: "success",
      };
    }

    if (confirmAction === "reject") {
      return {
        title: "Reject Car",
        body: "Are you sure you want to reject this car?",
        buttonText: "Yes, Reject",
        buttonVariant: "warning",
      };
    }

    if (confirmAction === "remove") {
      return {
        title: "Remove Car",
        body: "Are you sure you want to remove this car?",
        buttonText: "Yes, Remove",
        buttonVariant: "danger",
      };
    }

    return {
      title: "",
      body: "",
      buttonText: "Confirm",
      buttonVariant: "primary",
    };
  };

  const confirmContent = getConfirmContent();

  return (
    <div className="car-management-page d-grid gap-4">
      {error ? (
        <Alert variant={usingFallback ? "warning" : "danger"} className="mb-0">
          {error}
        </Alert>
      ) : null}

      <section className="car-stat-grid">
        {statCards.map((card) => (
          <Card key={card.label} className={`car-stat-card border-0 shadow-sm tone-${card.tone}`}>
            <Card.Body className="car-stat-body">
              <div className="car-stat-top">
                <div className="car-stat-icon">
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <Badge pill className="car-stat-badge">
                  {card.badge}
                </Badge>
              </div>
              <div className="car-stat-label">{card.label}</div>
              <div className="car-stat-value">
                {isLoadingSummary ? <Spinner animation="border" size="sm" /> : card.value}
              </div>
            </Card.Body>
          </Card>
        ))}
      </section>

      <Card className="car-table-shell border-0 shadow-sm overflow-hidden">
        <div className="car-table-tabs">
          <div className="car-table-tab-group">
            <button
              type="button"
              className={`car-table-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("all");
                setPage(0);
              }}
            >
              <span>All Cars</span>
            </button>
            <button
              type="button"
              className={`car-table-tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("pending");
                setPage(0);
              }}
            >
              <span>Pending Approvals</span>
              <span className="car-tab-counter">{formatNumber(pendingCount)}</span>
            </button>
          </div>
        </div>

        <div className="car-table-area">
          <div className="car-table-header">
            <div>Vehicle</div>
            <div>License Plate</div>
            <div>Price/Day</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {isLoadingCars ? (
            <div className="car-loading-state">
              <Spinner animation="border" />
            </div>
          ) : (carsPage.content || []).length === 0 ? (
            <div className="car-empty-state">
              No cars available in this view.
            </div>
          ) : (
            <div className="car-row-list">
              {(carsPage.content || []).map((car) => {
                const normalizedStatus = normalizeStatus(car.status);

                return (
                  <div key={car.id} className="car-row-card">
                    <div className="car-vehicle-cell">
                      <div className="car-thumb-shell">
                        {car.thumbnail ? (
                          <img
                            src={car.thumbnail}
                            alt={getVehicleLabel(car)}
                            className="car-thumb-image"
                          />
                        ) : (
                          <div className="car-thumb-placeholder">
                            <span className="material-symbols-outlined">image</span>
                          </div>
                        )}
                      </div>

                      <div className="car-vehicle-copy">
                        <div className="car-vehicle-name">{getVehicleLabel(car)}</div>
                      </div>
                    </div>

                    <div className="car-license-cell">{car.licensePlate || "--"}</div>
                    <div className="car-price-cell">{formatCurrency(car.pricePerDay)}</div>
                    <div>
                      <span className={`car-status-pill status-${normalizedStatus.toLowerCase()}`}>
                        {getStatusLabel(normalizedStatus)}
                      </span>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="car-detail-link"
                        onClick={() => handleOpenDetail(car.id)}
                      >
                        View Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="car-table-footer">
          <div className="car-table-summary">
            Showing {startItem} to {endItem} of {formatNumber(carsPage.totalElements)} entries
          </div>

          <Pagination className="mb-0 car-pagination">
            <Pagination.Prev
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
            />
            {visiblePages.map((pageNumber) => (
              <Pagination.Item
                key={pageNumber}
                active={pageNumber === page}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={page >= (carsPage.totalPages || 1) - 1}
              onClick={() =>
                setPage((current) =>
                  Math.min(current + 1, Math.max((carsPage.totalPages || 1) - 1, 0)),
                )
              }
            />
          </Pagination>
        </div>
      </Card>

      <Modal
        show={isDetailOpen}
        onHide={() => setIsDetailOpen(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="car-detail-header">
          <Modal.Title>Car Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body className="car-detail-body">
          {detailError ? <Alert variant="warning">{detailError}</Alert> : null}
          {actionError ? <Alert variant="danger">{actionError}</Alert> : null}

          {isDetailLoading ? (
            <div className="car-loading-state py-5">
              <Spinner animation="border" />
            </div>
          ) : !selectedCar ? (
            <Alert variant="secondary" className="mb-0">
              Car detail is unavailable.
            </Alert>
          ) : (
            <div className="car-detail-grid">
              <div className="car-detail-gallery">
                {(selectedCar.images || []).length > 0 ? (
                  <div className="car-detail-gallery-grid">
                    {(selectedCar.images || []).map((image, index) => (
                      <img
                        key={`${selectedCar.id}-${index}`}
                        src={image}
                        alt={`${getVehicleLabel(selectedCar)} ${index + 1}`}
                        className="car-detail-image"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="car-detail-image car-detail-placeholder">
                    <span className="material-symbols-outlined">directions_car</span>
                  </div>
                )}
              </div>

              <div className="car-detail-info">
                <div className="car-detail-title-row">
                  <div>
                    <div className="car-detail-title">
                      {getVehicleLabel(selectedCar)}
                    </div>
                    <div className="car-detail-subtitle">
                      {selectedCar.vehicleTypeName || "Vehicle"} • {selectedCar.year || "--"}
                    </div>
                  </div>
                  <span
                    className={`car-status-pill status-${normalizeStatus(
                      selectedCar.status,
                    ).toLowerCase()}`}
                  >
                    {getStatusLabel(selectedCar.status)}
                  </span>
                </div>

                <div className="car-detail-fields">
                  <div className="car-detail-field">
                    <span>License Plate</span>
                    <strong>{selectedCar.licensePlate || "--"}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Price/Day</span>
                    <strong>{formatCurrency(selectedCar.pricePerDay)}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Color</span>
                    <strong>{selectedCar.color || "--"}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Owner</span>
                    <strong>{selectedCar.ownerName || "--"}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Owner Email</span>
                    <strong>{selectedCar.ownerEmail || "--"}</strong>
                  </div>
                  <div className="car-detail-field car-detail-field-full">
                    <span>Location</span>
                    <strong>
                      {[selectedCar.locationName, selectedCar.locationAddress]
                        .filter(Boolean)
                        .join(", ") || "--"}
                    </strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Created At</span>
                    <strong>{formatDateTime(selectedCar.createdAt)}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Updated At</span>
                    <strong>{formatDateTime(selectedCar.updatedAt)}</strong>
                  </div>
                </div>

                <Form.Group className="mt-3">
                  <Form.Label className="car-detail-reject-label">
                    Rejection Reason
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={rejectReason}
                    isInvalid={Boolean(rejectReasonError)}
                    onChange={(event) => {
                      setRejectReason(event.target.value);
                      if (event.target.value.trim()) {
                        setRejectReasonError("");
                      }
                    }}
                    placeholder={selectedCar.rejectionReason || "Enter reason if you want to reject this car"}
                  />
                  <Form.Control.Feedback type="invalid">
                    {rejectReasonError}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="car-detail-footer">
          <Button
            variant="outline-secondary"
            onClick={() => setIsDetailOpen(false)}
            disabled={isSubmittingAction}
          >
            Close
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setConfirmAction("remove")}
            disabled={isSubmittingAction || !selectedCar?.id}
          >
            {isSubmittingAction ? "Processing..." : "Remove Car"}
          </Button>
          {isPendingSelectedCar ? (
            <>
              <Button
                variant="outline-warning"
                onClick={() => setConfirmAction("reject")}
                disabled={isSubmittingAction || !selectedCar?.id}
              >
                {isSubmittingAction ? "Processing..." : "Reject"}
              </Button>
              <Button
                variant="success"
                onClick={() => setConfirmAction("approve")}
                disabled={isSubmittingAction || !selectedCar?.id}
              >
                {isSubmittingAction ? "Processing..." : "Approve"}
              </Button>
            </>
          ) : null}
        </Modal.Footer>
      </Modal>

      <Modal
        show={Boolean(confirmAction)}
        onHide={() => {
          if (!isSubmittingAction) {
            setConfirmAction("");
          }
        }}
        centered
      >
        <Modal.Header closeButton={!isSubmittingAction}>
          <Modal.Title>{confirmContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmContent.body}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setConfirmAction("")}
            disabled={isSubmittingAction}
          >
            Cancel
          </Button>
          <Button
            variant={confirmContent.buttonVariant}
            onClick={async () => {
              const success = await handleConfirmAction();
              if (success) {
                setConfirmAction("");
              }
            }}
            disabled={isSubmittingAction}
          >
            {isSubmittingAction ? "Processing..." : confirmContent.buttonText}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CarManagementPage;
