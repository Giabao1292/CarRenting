import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  createAdminPromotion,
  deleteAdminPromotion,
  getAdminPromotionDetail,
  getAdminPromotions,
  updateAdminPromotion,
} from "../../services/admin/adminPromotionsService";
import "../../style/admin/PromotionManagement.css";

const PAGE_SIZE = 4;

const emptyPage = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: PAGE_SIZE,
};

const emptyForm = {
  code: "",
  discountType: "PERCENT",
  discountValue: "",
  startAt: "",
  endAt: "",
  usageLimit: "",
};

const mockPromotionsPage = {
  content: [
    {
      id: 1,
      code: "SUMMER2024",
      discountType: "PERCENT",
      discountValue: 15,
      startAt: "2024-06-01T00:00:00",
      endAt: "2024-08-31T23:59:00",
      usageLimit: 500,
      createdAt: "2024-05-20T08:00:00",
    },
    {
      id: 2,
      code: "WELCOME500",
      discountType: "FIXED",
      discountValue: 500000,
      startAt: "2024-01-01T00:00:00",
      endAt: "2024-12-31T23:59:00",
      usageLimit: 100,
      createdAt: "2024-01-01T08:00:00",
    },
    {
      id: 3,
      code: "BLACKFRIDAY",
      discountType: "PERCENT",
      discountValue: 30,
      startAt: "2023-11-20T00:00:00",
      endAt: "2023-11-30T23:59:00",
      usageLimit: 50,
      createdAt: "2023-11-01T08:00:00",
    },
    {
      id: 4,
      code: "VIPDRIVE",
      discountType: "FIXED",
      discountValue: 1200000,
      startAt: "2024-03-15T00:00:00",
      endAt: "2024-06-15T23:59:00",
      usageLimit: 50,
      createdAt: "2024-03-10T08:00:00",
    },
  ],
  totalPages: 3,
  totalElements: 124,
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

const formatDate = (value) => {
  if (!value) return "--";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const formatCurrency = (value) =>
  `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  )} VND`;

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

const formatDiscountValue = (promotion) => {
  if ((promotion?.discountType || "").toUpperCase() === "FIXED") {
    return formatCurrency(promotion.discountValue);
  }

  return `${Number(promotion?.discountValue || 0)}%`;
};

const getDiscountTypeLabel = (type) =>
  (type || "").toUpperCase() === "FIXED" ? "Cố định" : "Phần trăm";

const getDiscountTypeIcon = (type) =>
  (type || "").toUpperCase() === "FIXED" ? "local_atm" : "percent";

const normalizeDiscountType = (type) => {
  const normalized = (type || "").trim().toUpperCase();

  if (normalized === "FIXED") {
    return "FIXED";
  }

  return "PERCENT";
};

const getPromotionState = (promotion) => {
  const now = new Date();
  const startAt = promotion?.startAt ? new Date(promotion.startAt) : null;
  const endAt = promotion?.endAt ? new Date(promotion.endAt) : null;

  if (endAt && endAt < now) {
    return "expired";
  }

  if (startAt && startAt > now) {
    return "scheduled";
  }

  return "active";
};

const getUsageTone = (promotion) => {
  const state = getPromotionState(promotion);

  if (state === "expired") return "danger";
  if (state === "scheduled") return "amber";
  return "success";
};

const getTimelineProgress = (promotion) => {
  const startAt = promotion?.startAt ? new Date(promotion.startAt) : null;
  const endAt = promotion?.endAt ? new Date(promotion.endAt) : null;
  const now = new Date();

  if (!startAt || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return 0;
  }

  if (now <= startAt) return 8;
  if (now >= endAt) return 100;

  const total = endAt.getTime() - startAt.getTime();
  if (total <= 0) return 100;

  return Math.max(
    8,
    Math.min(100, Math.round(((now.getTime() - startAt.getTime()) / total) * 100)),
  );
};

const toDateTimeInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const toPayload = (formValues) => ({
  code: formValues.code.trim(),
  discountType: normalizeDiscountType(formValues.discountType),
  discountValue:
    formValues.discountValue === "" ? null : Number(formValues.discountValue),
  startAt: formValues.startAt || null,
  endAt: formValues.endAt || null,
  usageLimit: formValues.usageLimit === "" ? null : Number(formValues.usageLimit),
});

const validateForm = (formValues) => {
  const errors = {};
  const startAt = formValues.startAt ? new Date(formValues.startAt) : null;
  const endAt = formValues.endAt ? new Date(formValues.endAt) : null;
  const normalizedType = normalizeDiscountType(formValues.discountType);
  const numericDiscountValue = Number(formValues.discountValue);
  const numericUsageLimit = Number(formValues.usageLimit);

  if (!formValues.code.trim()) {
    errors.code = "Vui lòng nhập mã khuyến mãi.";
  }

  if (formValues.discountValue === "" || Number.isNaN(numericDiscountValue)) {
    errors.discountValue = "Giá trị giảm phải lớn hơn 0.";
  } else if (numericDiscountValue <= 0) {
    errors.discountValue = "Giá trị giảm phải lớn hơn 0.";
  }

  if (normalizedType === "PERCENT") {
    if (numericDiscountValue < 1 || numericDiscountValue > 100) {
      errors.discountValue = "Phần trăm giảm phải nằm trong khoảng từ 1 đến 100.";
    }
  }

  if (formValues.usageLimit === "" || Number.isNaN(numericUsageLimit)) {
    errors.usageLimit = "Vui lòng nhập số lượt sử dụng tối đa.";
  } else if (numericUsageLimit <= 0) {
    errors.usageLimit = "Số lượt sử dụng phải lớn hơn 0.";
  }

  if (!formValues.startAt) {
    errors.startAt = "Vui lòng chọn thời gian bắt đầu.";
  }

  if (!formValues.endAt) {
    errors.endAt = "Vui lòng chọn thời gian kết thúc.";
  }

  if (
    formValues.startAt &&
    formValues.endAt &&
    startAt &&
    endAt &&
    startAt >= endAt
  ) {
    errors.endAt = "Thời gian kết thúc phải sau thời gian bắt đầu.";
  }

  return errors;
};

const getDaysUntil = (value) => {
  if (!value) return null;

  const now = new Date();
  const target = new Date(value);
  const diff = target.getTime() - now.getTime();
  const dayCount = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (dayCount < 0) return null;
  if (dayCount === 0) return "Hôm nay";
  if (dayCount === 1) return "Còn 1 ngày";
  if (dayCount < 7) return `Còn ${dayCount} ngày`;
  if (dayCount < 14) return "Còn 1 tuần";
  return `Còn ${Math.ceil(dayCount / 7)} tuần`;
};

const PromotionManagementPage = () => {
  const [promotionsPage, setPromotionsPage] = useState(emptyPage);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [editingPromotionId, setEditingPromotionId] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadPromotions = useCallback(
    async (currentPage = page, currentKeyword = keyword) => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getAdminPromotions({
          keyword: currentKeyword,
          page: currentPage,
          size: PAGE_SIZE,
        });

        setPromotionsPage(data || emptyPage);
        setUsingFallback(false);
      } catch (fetchError) {
        setPromotionsPage(mockPromotionsPage);
        setError(
          fetchError.message ||
            "Không thể tải danh sách khuyến mãi từ API. Hệ thống đang hiển thị dữ liệu mẫu.",
        );
        setUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    },
    [keyword, page],
  );

  useEffect(() => {
    loadPromotions(page, keyword);
  }, [keyword, loadPromotions, page]);

  const visiblePages = buildPagination(page, promotionsPage.totalPages || 0);
  const startItem =
    (promotionsPage.totalElements || 0) === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem =
    startItem === 0
      ? 0
      : startItem + Math.max((promotionsPage.content || []).length - 1, 0);

  const stats = useMemo(() => {
    const items = promotionsPage.content || [];

    return items.reduce(
      (result, promotion) => {
        const state = getPromotionState(promotion);

        result.total += 1;
        result[getPromotionState(promotion)] += 1;
        result.limit += Number(promotion.usageLimit) || 0;
        if (state === "active" && normalizeDiscountType(promotion.discountType) === "PERCENT") {
          result.percent += 1;
        }
        return result;
      },
      { total: 0, active: 0, scheduled: 0, expired: 0, percent: 0, limit: 0 },
    );
  }, [promotionsPage.content]);

  const upcomingExpirations = useMemo(() => {
    return [...(promotionsPage.content || [])]
      .filter((promotion) => getDaysUntil(promotion.endAt))
      .sort((left, right) => new Date(left.endAt) - new Date(right.endAt))
      .slice(0, 3);
  }, [promotionsPage.content]);

  const openCreateModal = () => {
    setEditingPromotionId(null);
    setFormValues(emptyForm);
    setFormErrors({});
    setHasTriedSubmit(false);
    setSubmitError("");
    setIsFormOpen(true);
  };

  const openEditModal = async (promotionId) => {
    setEditingPromotionId(promotionId);
    setIsFormOpen(true);
    setIsDetailLoading(true);
    setSubmitError("");
    setFormErrors({});
    setHasTriedSubmit(false);

    try {
      const detail = await getAdminPromotionDetail(promotionId);
      setFormValues({
        code: detail?.code || "",
        discountType: normalizeDiscountType(detail?.discountType),
        discountValue: detail?.discountValue ?? "",
        startAt: toDateTimeInputValue(detail?.startAt),
        endAt: toDateTimeInputValue(detail?.endAt),
        usageLimit: detail?.usageLimit ?? "",
      });
    } catch (fetchError) {
      const fallbackPromotion = (promotionsPage.content || []).find(
        (promotion) => promotion.id === promotionId,
      );

      setFormValues({
        code: fallbackPromotion?.code || "",
        discountType: normalizeDiscountType(fallbackPromotion?.discountType),
        discountValue: fallbackPromotion?.discountValue ?? "",
        startAt: toDateTimeInputValue(fallbackPromotion?.startAt),
        endAt: toDateTimeInputValue(fallbackPromotion?.endAt),
        usageLimit: fallbackPromotion?.usageLimit ?? "",
      });
      setSubmitError(
        fetchError.message ||
          "Không thể tải chi tiết khuyến mãi từ API. Hệ thống đang dùng dữ liệu của dòng hiện tại.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleFormChange = ({ target: { name, value } }) => {
    setFormValues((current) => ({ ...current, [name]: value }));

    if (hasTriedSubmit) {
      const nextFormValues = { ...formValues, [name]: value };
      setFormErrors(validateForm(nextFormValues));
    } else {
      setFormErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const handleSubmitPromotion = async (event) => {
    event.preventDefault();
    setHasTriedSubmit(true);

    const nextErrors = validateForm(formValues);
    setFormErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = toPayload(formValues);

      if (editingPromotionId) {
        await updateAdminPromotion(editingPromotionId, payload);
      } else {
        await createAdminPromotion(payload);
      }

      setIsFormOpen(false);
      await loadPromotions(page, keyword);
    } catch (submitPromotionError) {
      setSubmitError(
        submitPromotionError.message ||
          "Không thể lưu khuyến mãi này. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromotion = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeletingId(deleteTarget.id);
      await deleteAdminPromotion(deleteTarget.id);
      setDeleteTarget(null);

      const shouldGoBack =
        page > 0 && (promotionsPage.content || []).length === 1;
      const nextPage = shouldGoBack ? page - 1 : page;

      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await loadPromotions(nextPage, keyword);
      }
    } catch (deleteError) {
      setError(deleteError.message || "Không thể xóa khuyến mãi này.");
      setUsingFallback(false);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(0);
    setKeyword(searchInput.trim());
  };

  return (
    <div className="promotion-management-page d-grid gap-4">
      {error ? (
        <Alert variant={usingFallback ? "warning" : "danger"} className="mb-0">
          {error}
        </Alert>
      ) : null}

      <Card className="border-0 shadow-sm promotion-shell-card">
        <Card.Body className="p-0">
          <div className="promotion-header">
            <div>
              <h1 className="promotion-page-title mb-2">Quản lý khuyến mãi</h1>
              <p className="promotion-page-subtitle mb-0">
                Xem và quản lý toàn bộ mã khuyến mãi đang hoạt động
              </p>
            </div>

            <Button className="promotion-create-button" onClick={openCreateModal}>
              <span className="material-symbols-outlined">add_circle</span>
              <span>Thêm khuyến mãi</span>
            </Button>
          </div>

          <div className="promotion-toolbar">
            <form className="promotion-search-form" onSubmit={handleSearchSubmit}>
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm theo mã khuyến mãi"
              />
            </form>

            <div className="promotion-summary-pills">
              <span className="promotion-summary-pill">
                {stats.active} đang hoạt động
              </span>
              <span className="promotion-summary-pill muted">
                {stats.scheduled} sắp diễn ra
              </span>
              <span className="promotion-summary-pill muted">
                {stats.expired} đã hết hạn
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <Table className="promotion-management-table align-middle mb-0">
              <thead>
                <tr>
                  <th>MÃ KHUYẾN MÃI</th>
                  <th>LOẠI</th>
                  <th>GIÁ TRỊ</th>
                  <th>GIỚI HẠN SỬ DỤNG</th>
                  <th>NGÀY BẮT ĐẦU</th>
                  <th>NGÀY KẾT THÚC</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : promotionsPage.content?.length ? (
                  promotionsPage.content.map((promotion) => {
                    const usageTone = getUsageTone(promotion);
                    const promotionState = getPromotionState(promotion);
                    const progress = getTimelineProgress(promotion);

                    return (
                      <tr key={promotion.id}>
                        <td>
                          <div className={`promotion-code-chip ${promotionState}`}>
                            {promotion.code || "--"}
                          </div>
                        </td>
                        <td>
                          <div className="promotion-type-cell">
                            <span className="material-symbols-outlined">
                              {getDiscountTypeIcon(promotion.discountType)}
                            </span>
                            <span>{getDiscountTypeLabel(promotion.discountType)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="promotion-value-cell">
                            {formatDiscountValue(promotion)}
                          </div>
                        </td>
                        <td>
                          <div className="promotion-usage-box">
                            <div className="promotion-usage-track">
                              <span
                                className={`promotion-usage-fill ${usageTone}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div
                              className={`promotion-usage-text ${promotionState === "expired" ? "expired" : ""}`}
                            >
                              {promotionState === "expired"
                                ? "Đã kết thúc"
                                : `${formatNumber(promotion.usageLimit)} lượt tối đa`}
                            </div>
                          </div>
                        </td>
                        <td className="promotion-date-cell">
                          {formatDate(promotion.startAt)}
                        </td>
                        <td className="promotion-date-cell">
                          {formatDate(promotion.endAt)}
                        </td>
                        <td>
                          <div className="promotion-actions">
                            <button
                              type="button"
                              className="promotion-action-button"
                              onClick={() => openEditModal(promotion.id)}
                              aria-label={`Edit ${promotion.code}`}
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              type="button"
                              className="promotion-action-button danger"
                              onClick={() => setDeleteTarget(promotion)}
                              aria-label={`Delete ${promotion.code}`}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      Không tìm thấy khuyến mãi nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="promotion-table-footer">
            <div className="promotion-records-text">
              Hiển thị {startItem} đến {endItem} trên tổng{" "}
              {formatNumber(promotionsPage.totalElements)} mục
            </div>

            <Pagination className="mb-0 promotion-pagination">
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
                disabled={page >= (promotionsPage.totalPages || 1) - 1}
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, Math.max((promotionsPage.totalPages || 1) - 1, 0)),
                  )
                }
              />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xl={8}>
          <Card className="border-0 shadow-sm promotion-automation-card h-100">
            <Card.Body>
              <div className="promotion-automation-art">
                <span className="material-symbols-outlined star-lg">auto_awesome</span>
                <span className="material-symbols-outlined star-md">auto_awesome</span>
                <span className="material-symbols-outlined star-sm">auto_awesome</span>
              </div>

              <div className="promotion-automation-label">Chiến dịch thông minh</div>
              <h2 className="promotion-automation-title mb-3">
                Tự động hóa tăng trưởng
              </h2>
              <p className="promotion-automation-copy mb-4">
                Thiết lập các kích hoạt thông minh cho thưởng khách hàng thân thiết
                và ưu đãi theo mùa. Phần logic để hệ thống lo, bạn tập trung mở rộng.
              </p>

              <div className="promotion-automation-actions">
                <Button
                  variant="light"
                  className="promotion-automation-primary"
                  onClick={openCreateModal}
                >
                  Thiết lập quy tắc
                </Button>
                <Button
                  variant="outline-light"
                  className="promotion-automation-secondary"
                >
                  Tài liệu
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="border-0 shadow-sm promotion-expiring-card h-100">
            <Card.Body>
              <h2 className="promotion-expiring-title">Sắp hết hạn</h2>

              <div className="promotion-expiring-list">
                {upcomingExpirations.length ? (
                  upcomingExpirations.map((promotion, index) => (
                    <div key={promotion.id} className="promotion-expiring-item">
                      <div className="d-flex align-items-center gap-3">
                        <span
                          className={`promotion-expiring-dot tone-${
                            index === 0 ? "red" : "amber"
                          }`}
                        />
                        <span className="promotion-expiring-code">{promotion.code}</span>
                      </div>
                      <span className="promotion-expiring-time">
                        {getDaysUntil(promotion.endAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="promotion-expiring-empty">
                    Không có khuyến mãi nào sắp hết hạn.
                  </div>
                )}
              </div>

              <button type="button" className="promotion-expiring-link">
                Xem toàn bộ lịch
              </button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={isFormOpen}
        onHide={() => !isSubmitting && setIsFormOpen(false)}
        centered
        size="lg"
        scrollable
      >
        <Form noValidate onSubmit={handleSubmitPromotion}>
          <Modal.Header closeButton className="border-0 pb-0">
            <div>
              <Modal.Title className="promotion-modal-title">
                {editingPromotionId ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"}
              </Modal.Title>
              <div className="promotion-modal-subtitle">
                Điền đầy đủ thông tin cần thiết để lưu mã khuyến mãi này.
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="pt-3">
            {submitError ? (
              <Alert variant="danger" className="mb-3">
                {submitError}
              </Alert>
            ) : null}

            {hasTriedSubmit && Object.keys(formErrors).length ? (
              <Alert variant="danger" className="mb-3">
                Vui lòng điền các trường bắt buộc được tô đỏ.
              </Alert>
            ) : null}

            {isDetailLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="success" />
              </div>
            ) : (
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Mã khuyến mãi *</Form.Label>
                    <Form.Control
                      name="code"
                      value={formValues.code}
                      onChange={handleFormChange}
                      isInvalid={Boolean(formErrors.code)}
                      placeholder="SUMMER2026"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.code}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Loại giảm giá *</Form.Label>
                    <Form.Select
                      name="discountType"
                      value={formValues.discountType}
                      onChange={handleFormChange}
                    >
                      <option value="PERCENT">Phần trăm</option>
                      <option value="FIXED">Cố định</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Giá trị giảm *</Form.Label>
                    <Form.Control
                      name="discountValue"
                      type="number"
                      min="0.01"
                      max={formValues.discountType === "PERCENT" ? "100" : undefined}
                      step={formValues.discountType === "PERCENT" ? "1" : "0.01"}
                      value={formValues.discountValue}
                      onChange={handleFormChange}
                      isInvalid={Boolean(formErrors.discountValue)}
                      placeholder={
                        formValues.discountType === "FIXED" ? "500000" : "15"
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.discountValue}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Giới hạn sử dụng</Form.Label>
                    <Form.Control
                      name="usageLimit"
                      type="number"
                      min="1"
                      step="1"
                      value={formValues.usageLimit}
                      onChange={handleFormChange}
                      isInvalid={Boolean(formErrors.usageLimit)}
                      placeholder="100"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.usageLimit}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Bắt đầu lúc</Form.Label>
                    <Form.Control
                      name="startAt"
                      type="datetime-local"
                      value={formValues.startAt}
                      onChange={handleFormChange}
                      isInvalid={Boolean(formErrors.startAt)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.startAt}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Kết thúc lúc</Form.Label>
                    <Form.Control
                      name="endAt"
                      type="datetime-local"
                      value={formValues.endAt}
                      onChange={handleFormChange}
                      isInvalid={Boolean(formErrors.endAt)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.endAt}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 promotion-modal-footer">
            <Button
              variant="outline-secondary"
              className="promotion-modal-cancel"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="success"
              className="promotion-modal-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Đang lưu...
                </>
              ) : editingPromotionId ? (
                "Lưu thay đổi"
              ) : (
                "Tạo khuyến mãi"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={Boolean(deleteTarget)}
        onHide={() => !deletingId && setDeleteTarget(null)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Xóa khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Xóa khuyến mãi <strong>{deleteTarget?.code}</strong>? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setDeleteTarget(null)}
            disabled={Boolean(deletingId)}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDeletePromotion}
            disabled={Boolean(deletingId)}
          >
            {deletingId ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PromotionManagementPage;
