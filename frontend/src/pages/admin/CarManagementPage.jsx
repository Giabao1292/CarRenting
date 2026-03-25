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

  if (normalized === "AVAILABLE") return "Sẵn sàng";
  if (normalized === "PENDING") return "Chờ duyệt";
  if (normalized === "REJECTED") return "Từ chối";
  if (normalized === "INACTIVE") return "Ngừng hoạt động";
  if (["UNAVAILABLE", "RENTED", "BOOKED"].includes(normalized)) {
    return "Không khả dụng";
  }
  if (normalized === "REMOVED") return "Đã gỡ";

  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
};

const getVehicleLabel = (car) =>
  [car.brand, car.model].filter(Boolean).join(" ") || "Unnamed vehicle";

const getFallbackPage = (tab) => (tab === "pending" ? mockPendingPage : mockCarsPage);

const getCarSortValue = (car) => {
  const localTouchedAt = Number(car?._localTouchedAt || 0);

  if (localTouchedAt > 0) {
    return localTouchedAt;
  }

  const updatedAt = car?.updatedAt ? new Date(car.updatedAt).getTime() : 0;
  if (!Number.isNaN(updatedAt) && updatedAt > 0) {
    return updatedAt;
  }

  const createdAt = car?.createdAt ? new Date(car.createdAt).getTime() : 0;
  if (!Number.isNaN(createdAt) && createdAt > 0) {
    return createdAt;
  }

  return Number(car?.id) || 0;
};

const sortCarsDesc = (cars = []) =>
  [...cars].sort((left, right) => getCarSortValue(right) - getCarSortValue(left));

const normalizeCarsPage = (pageData) => ({
  ...pageData,
  content: sortCarsDesc(pageData?.content || []),
});

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
          "Không thể tải thống kê xe từ API. Hệ thống đang hiển thị dữ liệu mẫu.",
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

      setCarsPage(normalizeCarsPage(data || emptyPage));
      setUsingFallback(false);
    } catch (fetchError) {
      setCarsPage(normalizeCarsPage(getFallbackPage(currentTab)));
      setError(
        fetchError.message ||
          "Không thể tải danh sách xe từ API. Hệ thống đang hiển thị dữ liệu mẫu.",
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
        label: "Tổng số xe",
        value: formatNumber(summary.totalCars),
        badge: `${formatNumber(pendingCount)} chờ duyệt`,
      icon: "inventory_2",
      tone: "green",
    },
    {
        label: "Xe sẵn sàng",
        value: formatNumber(summary.availableCars),
        badge: `${availableRate}% đội xe`,
      icon: "task_alt",
      tone: "cyan",
    },
    {
        label: "Xe bị từ chối",
        value: formatNumber(summary.rejectedCars),
        badge: "Cần xem xét",
      icon: "error",
      tone: "rose",
    },
    {
        label: "Xe không khả dụng hôm nay",
        value: formatNumber(summary.unavailableCars),
        badge: "Đơn thuê đang chạy",
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
          "Không thể tải chi tiết xe từ API. Hệ thống sẽ hiển thị dữ liệu mẫu nếu có.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const syncCarListAfterStatusChange = (nextCar) => {
    if (!nextCar?.id) return;

    setCarsPage((current) => {
      const currentContent = current.content || [];
      const nextStatus = normalizeStatus(nextCar.status);
      const shouldKeepInCurrentTab =
        activeTab !== "pending" || nextStatus === "PENDING";

      const remainingCars = currentContent.filter((car) => car.id !== nextCar.id);
      const nextContent = shouldKeepInCurrentTab
        ? sortCarsDesc([
            {
              ...nextCar,
              _localTouchedAt: Date.now(),
            },
            ...remainingCars,
          ])
        : remainingCars;

      return {
        ...current,
        content: nextContent,
        totalElements: shouldKeepInCurrentTab
          ? current.totalElements
          : Math.max((current.totalElements || 0) - 1, 0),
      };
    });
  };

  const refreshAfterAction = async () => {
    await loadSummary();
  };

  const handleApprove = async () => {
    if (!selectedCar?.id) return;

    try {
      setIsSubmittingAction(true);
      setActionError("");
      await approveAdminCar(selectedCar.id);
      const nextStatus = "AVAILABLE";
      const updatedCar = {
        ...selectedCar,
        status: nextStatus,
        rejectionReason: null,
      };
      setSelectedCar(updatedCar);
      syncCarListAfterStatusChange(updatedCar);
      await refreshAfterAction();
      setIsDetailOpen(false);
      setSelectedCar(null);
      setDetailError("");
      setRejectReason("");
      setRejectReasonError("");
      return true;
    } catch (submitError) {
      setActionError(submitError.message || "Không thể duyệt xe này.");
      return false;
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCar?.id) return;
    const trimmedReason = rejectReason.trim();

    if (!trimmedReason) {
      setRejectReasonError("Vui lòng nhập lý do từ chối.");
      setActionError("");
      return false;
    }

    try {
      setIsSubmittingAction(true);
      setActionError("");
      setRejectReasonError("");
      await rejectAdminCar(selectedCar.id, trimmedReason);
      const updatedCar = {
        ...selectedCar,
        status: "REJECTED",
        rejectionReason: trimmedReason,
      };
      setSelectedCar(updatedCar);
      syncCarListAfterStatusChange(updatedCar);
      await refreshAfterAction();
      return true;
    } catch (submitError) {
      setActionError(submitError.message || "Không thể từ chối xe này.");
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
      syncCarListAfterStatusChange({
        ...selectedCar,
        status: "REMOVED",
      });
      setIsDetailOpen(false);
      setSelectedCar(null);
      await refreshAfterAction();
      return true;
    } catch (submitError) {
      setActionError(submitError.message || "Không thể gỡ xe này.");
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
        title: "Duyệt xe",
        body: "Bạn có chắc muốn duyệt xe này?",
        buttonText: "Xác nhận duyệt",
        buttonVariant: "success",
      };
    }

    if (confirmAction === "reject") {
      return {
        title: "Từ chối xe",
        body: "Bạn có chắc muốn từ chối xe này?",
        buttonText: "Xác nhận từ chối",
        buttonVariant: "warning",
      };
    }

    if (confirmAction === "remove") {
      return {
        title: "Gỡ xe",
        body: "Bạn có chắc muốn gỡ xe này?",
        buttonText: "Xác nhận gỡ",
        buttonVariant: "danger",
      };
    }

    return {
      title: "",
      body: "",
      buttonText: "Xác nhận",
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
              <span>Tất cả xe</span>
            </button>
            <button
              type="button"
              className={`car-table-tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("pending");
                setPage(0);
              }}
            >
              <span>Chờ duyệt</span>
              <span className="car-tab-counter">{formatNumber(pendingCount)}</span>
            </button>
          </div>
        </div>

        <div className="car-table-area">
          <div className="car-table-header">
            <div>Xe</div>
            <div>Biển số</div>
            <div>Giá/ngày</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>

          {isLoadingCars ? (
            <div className="car-loading-state">
              <Spinner animation="border" />
            </div>
          ) : (carsPage.content || []).length === 0 ? (
            <div className="car-empty-state">
              Không có xe nào trong mục này.
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
                        Xem chi tiết
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
            Hiển thị {startItem} đến {endItem} trên tổng {formatNumber(carsPage.totalElements)} mục
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
        dialogClassName="car-detail-modal"
      >
        <Modal.Header closeButton className="car-detail-header">
          <Modal.Title>Chi tiết xe</Modal.Title>
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
              Không có dữ liệu chi tiết xe.
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
                      {selectedCar.vehicleTypeName || "Xe"} • {selectedCar.year || "--"}
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
                    <span>Biển số</span>
                    <strong>{selectedCar.licensePlate || "--"}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Giá/ngày</span>
                    <strong>{formatCurrency(selectedCar.pricePerDay)}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Màu sắc</span>
                    <strong>{selectedCar.color || "--"}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Chủ xe</span>
                    <strong>{selectedCar.ownerName || "--"}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Email chủ xe</span>
                    <strong>{selectedCar.ownerEmail || "--"}</strong>
                  </div>
                  <div className="car-detail-field car-detail-field-full">
                    <span>Địa điểm</span>
                    <strong>
                      {[selectedCar.locationName, selectedCar.locationAddress]
                        .filter(Boolean)
                        .join(", ") || "--"}
                    </strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Ngày tạo</span>
                    <strong>{formatDateTime(selectedCar.createdAt)}</strong>
                  </div>
                  <div className="car-detail-field">
                    <span>Cập nhật lúc</span>
                    <strong>{formatDateTime(selectedCar.updatedAt)}</strong>
                  </div>
                </div>

                <Form.Group className="mt-3">
                  <Form.Label className="car-detail-reject-label">
                    Lý do từ chối
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
                    placeholder={selectedCar.rejectionReason || "Nhập lý do nếu bạn muốn từ chối xe này"}
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
            Đóng
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setConfirmAction("remove")}
            disabled={isSubmittingAction || !selectedCar?.id}
          >
            {isSubmittingAction ? "Đang xử lý..." : "Gỡ xe"}
          </Button>
          {isPendingSelectedCar ? (
            <>
              <Button
                variant="outline-warning"
                onClick={() => setConfirmAction("reject")}
                disabled={isSubmittingAction || !selectedCar?.id}
              >
                {isSubmittingAction ? "Đang xử lý..." : "Từ chối"}
              </Button>
              <Button
                variant="success"
                onClick={() => setConfirmAction("approve")}
                disabled={isSubmittingAction || !selectedCar?.id}
              >
                {isSubmittingAction ? "Đang xử lý..." : "Duyệt"}
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
            Hủy
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
            {isSubmittingAction ? "Đang xử lý..." : confirmContent.buttonText}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CarManagementPage;
