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
  approveAdminLicense,
  getAdminLicenseDetail,
  getAdminLicenses,
  rejectAdminLicense,
} from "../../services/admin/adminLicensesService";
import "../../style/admin/LicenseManagement.css";

const PAGE_SIZE = 10;
const LICENSE_LIST_FALLBACK_MESSAGE =
  "Không thể tải dữ liệu giấy phép từ máy chủ. Hệ thống đang hiển thị dữ liệu mẫu.";
const LICENSE_DETAIL_FALLBACK_MESSAGE =
  "Không thể tải chi tiết giấy phép từ máy chủ. Hệ thống đang hiển thị dữ liệu mẫu nếu có.";

const emptyPage = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: PAGE_SIZE,
};

const mockLicensesPage = {
  content: [
    {
      id: 1,
      userId: 15,
      userName: "Nguyen Van A",
      userEmail: "vana@example.com",
      userPhone: "0901111111",
      docType: "DRIVING_LICENSE",
      docNumber: "B2-123456789",
      fileUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
      verified: false,
      expiryDate: "2028-12-31",
      createdAt: "2026-03-20T09:15:00",
      status: "PENDING",
      reason: null,
    },
    {
      id: 2,
      userId: 24,
      userName: "Tran Thi B",
      userEmail: "thib@example.com",
      userPhone: "0902222222",
      docType: "DRIVING_LICENSE",
      docNumber: "A1-987654321",
      fileUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
      verified: true,
      expiryDate: "2030-05-10",
      createdAt: "2026-03-18T14:30:00",
      status: "APPROVED",
      reason: null,
    },
    {
      id: 3,
      userId: 36,
      userName: "Le Van C",
      userEmail: "vanc@example.com",
      userPhone: "0903333333",
      docType: "DRIVING_LICENSE",
      docNumber: "B1-456123789",
      fileUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
      verified: false,
      expiryDate: "2027-08-15",
      createdAt: "2026-03-17T08:45:00",
      status: "REJECTED",
      reason: "The uploaded image is blurry and the number is unreadable.",
    },
  ],
  totalPages: 1,
  totalElements: 3,
  number: 0,
  size: PAGE_SIZE,
};

const mockLicenseDetails = {
  1: {
    ...mockLicensesPage.content[0],
    userAddress: "Thu Duc, Ho Chi Minh City",
  },
  2: {
    ...mockLicensesPage.content[1],
    userAddress: "Hai Chau, Da Nang",
  },
  3: {
    ...mockLicensesPage.content[2],
    userAddress: "Cau Giay, Hanoi",
  },
};

const STATUS_TABS = [
  { label: "Tất cả", value: "" },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Từ chối", value: "REJECTED" },
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

const normalizeStatus = (status) => (status || "UNKNOWN").toUpperCase();

const formatDate = (value) => {
  if (!value) return "--";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

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

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "PENDING") return "Chờ duyệt";
  if (normalized === "APPROVED") return "Đã duyệt";
  if (normalized === "REJECTED") return "Từ chối";

  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
};

const getStatusVariant = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "APPROVED") return "success";
  if (normalized === "REJECTED") return "danger";
  if (normalized === "PENDING") return "warning";

  return "secondary";
};

const isPendingLicense = (license) =>
  normalizeStatus(license?.status) === "PENDING";

const canApprove = (license) => isPendingLicense(license);

const canReject = (license) => isPendingLicense(license);

const LicenseManagementPage = () => {
  const [licensesPage, setLicensesPage] = useState(emptyPage);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const [isRejectMode, setIsRejectMode] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLicenses = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getAdminLicenses({
          keyword,
          status: selectedStatus,
          page,
          size: PAGE_SIZE,
        });

        if (!isMounted) return;

        setLicensesPage(data || emptyPage);
        setUsingFallback(false);
      } catch (fetchError) {
        if (!isMounted) return;

        setLicensesPage(mockLicensesPage);
        setUsingFallback(true);
        setError(LICENSE_LIST_FALLBACK_MESSAGE);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLicenses();

    return () => {
      isMounted = false;
    };
  }, [keyword, selectedStatus, page]);

  const licenseStats = useMemo(() => {
    const licenses = licensesPage.content || [];

    return {
      total: licensesPage.totalElements || licenses.length,
      pending: licenses.filter(
        (license) => normalizeStatus(license.status) === "PENDING",
      ).length,
      approved: licenses.filter(
        (license) => normalizeStatus(license.status) === "APPROVED",
      ).length,
      rejected: licenses.filter(
        (license) => normalizeStatus(license.status) === "REJECTED",
      ).length,
    };
  }, [licensesPage]);

  const visiblePages = buildPagination(page, licensesPage.totalPages || 0);
  const startItem =
    (licensesPage.content || []).length === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem =
    startItem === 0 ? 0 : startItem + (licensesPage.content || []).length - 1;

  const resetActionState = () => {
    setActionError("");
    setRejectReason("");
    setRejectReasonError("");
    setIsRejectMode(false);
  };

  const syncDetailIntoList = (detail) => {
    if (!detail?.id) return;

    setLicensesPage((current) => ({
      ...current,
      content: (current.content || []).map((license) =>
        license.id === detail.id ? { ...license, ...detail } : license,
      ),
    }));
  };

  const applyLocalLicenseUpdate = (updates) => {
    if (!selectedLicense?.id) return;

    const merged = { ...selectedLicense, ...updates };
    syncDetailIntoList(merged);
    setIsDetailOpen(false);
    setSelectedLicense(null);
    setDetailError("");
    resetActionState();
  };

  const handleOpenDetail = async (licenseId) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailError("");
    resetActionState();

    try {
      const detail = await getAdminLicenseDetail(licenseId);
      setSelectedLicense(detail);
    } catch (fetchError) {
      setSelectedLicense(mockLicenseDetails[licenseId] || null);
      setDetailError(LICENSE_DETAIL_FALLBACK_MESSAGE);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedLicense?.id || !canApprove(selectedLicense)) return;

    try {
      setIsSubmittingAction(true);
      setActionError("");

      const updated = await approveAdminLicense(selectedLicense.id);
      applyLocalLicenseUpdate({
        ...updated,
        status: "APPROVED",
        verified: true,
        reason: null,
      });
    } catch (submitError) {
      setActionError(
        submitError.message || "Không thể duyệt giấy phép này.",
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLicense?.id || !canReject(selectedLicense)) return;

    const trimmedReason = rejectReason.trim();

    if (!trimmedReason) {
      setRejectReasonError("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      setIsSubmittingAction(true);
      setActionError("");
      setRejectReasonError("");

      const updated = await rejectAdminLicense(selectedLicense.id, trimmedReason);
      applyLocalLicenseUpdate({
        ...updated,
        status: "REJECTED",
        verified: false,
        reason: trimmedReason,
      });
    } catch (submitError) {
      setActionError(
        submitError.message || "Không thể từ chối giấy phép này.",
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="license-management-page d-grid gap-4">
      <section className="license-hero-card">
        <div>
          <div className="license-hero-eyebrow">Khu vực xác minh</div>
          <h1 className="license-page-title mb-2">Quản Lý Giấy Phép</h1>
          <p className="license-page-subtitle mb-0">
            Kiểm tra hồ sơ giấy phép lái xe, xác minh thông tin người dùng và
            xử lý duyệt hoặc từ chối trong cùng một nơi.
          </p>
        </div>

        <div className="license-stat-strip">
          <div className="license-mini-stat">
            <span className="material-symbols-outlined">badge</span>
            <div>
              <div className="license-mini-label">Tổng số</div>
              <div className="license-mini-value">{licenseStats.total}</div>
            </div>
          </div>
          <div className="license-mini-stat">
            <span className="material-symbols-outlined">schedule</span>
            <div>
              <div className="license-mini-label">Chờ duyệt</div>
              <div className="license-mini-value">{licenseStats.pending}</div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <Alert variant={usingFallback ? "warning" : "danger"} className="mb-0">
          {error}
        </Alert>
      ) : null}

      <Row className="g-4">
        <Col md={6} xl={3}>
          <Card className="license-stat-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="license-stat-label">Chờ xử lý</div>
              <div className="license-stat-value">{licenseStats.pending}</div>
              <div className="license-stat-note">
                Hồ sơ đang chờ quản trị viên xử lý
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="license-stat-card border-0 shadow-sm h-100 approved">
            <Card.Body>
              <div className="license-stat-label">Đã duyệt</div>
              <div className="license-stat-value">{licenseStats.approved}</div>
              <div className="license-stat-note">Giấy phép đã được xác minh</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="license-stat-card border-0 shadow-sm h-100 rejected">
            <Card.Body>
              <div className="license-stat-label">Từ chối</div>
              <div className="license-stat-value">{licenseStats.rejected}</div>
              <div className="license-stat-note">Cần gửi lại hoặc chỉnh sửa</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="license-tip-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="license-stat-label">Lưu ý</div>
              <div className="license-tip-copy">
                Ưu tiên kiểm tra các giấy phép sắp hết hạn hoặc bị từ chối do
                ảnh mờ, khó đọc.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="license-filter-card border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <Form.Control
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(0);
                }}
                placeholder="Tìm theo tên, email, số điện thoại hoặc số giấy phép"
                className="license-search-input"
              />
            </Col>

            <Col lg={6}>
              <div className="license-status-tabs">
                {STATUS_TABS.map((tab) => {
                  const isActive = selectedStatus === tab.value;

                  return (
                    <button
                      key={tab.label}
                      type="button"
                      className={`license-status-tab ${isActive ? "active" : ""}`}
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
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table className="align-middle mb-0 license-management-table">
            <thead>
              <tr>
                <th>NGƯỜI DÙNG</th>
                <th>GIẤY TỜ</th>
                <th>LOẠI</th>
                <th>TRẠNG THÁI</th>
                <th>HẾT HẠN</th>
                <th>NGÀY GỬI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang tải danh sách giấy phép...
                  </td>
                </tr>
              ) : (licensesPage.content || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    Không có giấy phép nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                (licensesPage.content || []).map((license) => (
                  <tr key={license.id}>
                    <td>
                      <div className="license-user-cell">
                        <div className="license-user-name">
                          {license.userName || "--"}
                        </div>
                        <div className="license-user-meta">
                          {license.userEmail || "--"}
                        </div>
                        <div className="license-user-meta">
                          {license.userPhone || "--"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">
                        {license.docNumber || "--"}
                      </div>
                    </td>
                    <td>{license.docType || "--"}</td>
                    <td>
                      <Badge bg={getStatusVariant(license.status)}>
                        {getStatusLabel(license.status)}
                      </Badge>
                    </td>
                    <td>{formatDate(license.expiryDate)}</td>
                    <td>{formatDateTime(license.createdAt)}</td>
                    <td>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => handleOpenDetail(license.id)}
                      >
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        <div className="license-table-footer">
          <div className="license-table-count text-muted">
            Hiển thị {startItem}-{endItem} trên tổng{" "}
            {licensesPage.totalElements || 0} giấy phép
          </div>

          <Pagination className="mb-0">
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
              disabled={page >= (licensesPage.totalPages || 1) - 1}
              onClick={() =>
                setPage((current) =>
                  Math.min(current + 1, Math.max((licensesPage.totalPages || 1) - 1, 0)),
                )
              }
            />
          </Pagination>
        </div>
      </Card>

      <Modal
        show={isDetailOpen}
        onHide={() => {
          setIsDetailOpen(false);
          setSelectedLicense(null);
          setDetailError("");
          resetActionState();
        }}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi Tiết Duyệt Giấy Phép</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailError ? (
            <Alert variant="warning" className="mb-3">
              {detailError}
            </Alert>
          ) : null}

          {isDetailLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : !selectedLicense ? (
            <Alert variant="secondary" className="mb-0">
              Không có dữ liệu chi tiết giấy phép.
            </Alert>
          ) : (
            <Row className="g-4">
              <Col lg={7}>
                <Card className="border-0 bg-light h-100">
                  <Card.Body>
                    <div className="license-detail-section-title">
                      Thông tin người dùng
                    </div>
                    <div className="license-detail-grid">
                      <div>
                        <span>Họ tên</span>
                        <strong>{selectedLicense.userName || "--"}</strong>
                      </div>
                      <div>
                        <span>Email</span>
                        <strong>{selectedLicense.userEmail || "--"}</strong>
                      </div>
                      <div>
                        <span>Số điện thoại</span>
                        <strong>{selectedLicense.userPhone || "--"}</strong>
                      </div>
                      <div>
                        <span>Địa chỉ</span>
                        <strong>{selectedLicense.userAddress || "--"}</strong>
                      </div>
                      <div>
                        <span>Loại giấy tờ</span>
                        <strong>{selectedLicense.docType || "--"}</strong>
                      </div>
                      <div>
                        <span>Số giấy tờ</span>
                        <strong>{selectedLicense.docNumber || "--"}</strong>
                      </div>
                      <div>
                        <span>Trạng thái</span>
                        <strong>{getStatusLabel(selectedLicense.status)}</strong>
                      </div>
                      <div>
                        <span>Ngày hết hạn</span>
                        <strong>{formatDate(selectedLicense.expiryDate)}</strong>
                      </div>
                      <div>
                        <span>Thời gian gửi</span>
                        <strong>{formatDateTime(selectedLicense.createdAt)}</strong>
                      </div>
                      <div>
                        <span>Đã xác minh</span>
                        <strong>{selectedLicense.verified ? "Có" : "Không"}</strong>
                      </div>
                    </div>

                    {selectedLicense.reason ? (
                      <div className="license-reason-box mt-4">
                        <div className="license-detail-section-title mb-2">
                          Lý do từ chối
                        </div>
                        <p className="mb-0">{selectedLicense.reason}</p>
                      </div>
                    ) : null}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={5}>
                <Card className="border-0 bg-light h-100">
                  <Card.Body className="d-flex flex-column gap-3">
                    <div className="license-detail-section-title">
                      Ảnh giấy tờ đã tải lên
                    </div>

                    {selectedLicense.fileUrl ? (
                      <>
                        <img
                          src={selectedLicense.fileUrl}
                          alt={selectedLicense.docNumber || "License"}
                          className="license-preview-image"
                        />
                        <a
                          href={selectedLicense.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-secondary"
                        >
                          Mở ảnh gốc
                        </a>
                      </>
                    ) : (
                      <div className="license-image-placeholder">
                        Không có ảnh xem trước
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {actionError ? (
            <Alert variant="danger" className="mt-3 mb-0">
              {actionError}
            </Alert>
          ) : null}

          {selectedLicense &&
          isPendingLicense(selectedLicense) &&
          isRejectMode ? (
            <Card className="border-0 bg-light mt-4">
              <Card.Body>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Lý do từ chối
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    maxLength={500}
                    value={rejectReason}
                    onChange={(event) => {
                      setRejectReason(event.target.value);
                      if (rejectReasonError) {
                        setRejectReasonError("");
                      }
                    }}
                    placeholder="Nhập lý do từ chối giấy phép này"
                  />
                  <div className="d-flex justify-content-between mt-2">
                    <small className="text-muted">
                      Nội dung này sẽ giúp người dùng gửi lại hồ sơ đúng hơn.
                    </small>
                    <small className="text-muted">{rejectReason.length}/500</small>
                  </div>
                  {rejectReasonError ? (
                    <div className="text-danger small mt-2">
                      {rejectReasonError}
                    </div>
                  ) : null}
                </Form.Group>
              </Card.Body>
            </Card>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => {
              setIsDetailOpen(false);
              setSelectedLicense(null);
              setDetailError("");
              resetActionState();
            }}
          >
            Đóng
          </Button>

          {selectedLicense && isPendingLicense(selectedLicense) ? (
            <div className="d-flex gap-2">
              {isRejectMode ? (
                <>
                  <Button
                    variant="outline-secondary"
                    onClick={resetActionState}
                    disabled={isSubmittingAction}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    disabled={isSubmittingAction || !canReject(selectedLicense)}
                  >
                    {isSubmittingAction ? "Đang từ chối..." : "Xác nhận từ chối"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline-danger"
                    onClick={() => setIsRejectMode(true)}
                    disabled={isSubmittingAction || !canReject(selectedLicense)}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleApprove}
                    disabled={isSubmittingAction || !canApprove(selectedLicense)}
                  >
                    {isSubmittingAction ? "Đang duyệt..." : "Duyệt"}
                  </Button>
                </>
              )}
            </div>
          ) : null}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LicenseManagementPage;
