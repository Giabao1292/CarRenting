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
  approveOwner,
  getAdminOwnerDetail,
  getAdminOwnerSummary,
  getApprovedOwners,
  getPendingOwners,
  getRejectedOwners,
  rejectOwner,
} from "../../services/admin/adminOwnersService";
import "../../style/admin/OwnerManagement.css";

const PAGE_SIZE = 10;

const EMPTY_SUMMARY = {
  totalRequests: 0,
  pendingOwners: 0,
  approvedOwners: 0,
  rejectedOwners: 0,
};

const EMPTY_PAGE = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
};

const STATUS_TABS = [
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "REJECTED", label: "Bị từ chối" },
];

const OWNER_FETCHERS = {
  PENDING: getPendingOwners,
  APPROVED: getApprovedOwners,
  REJECTED: getRejectedOwners,
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

const formatDate = (value) => {
  if (!value) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const getInitials = (fullName) =>
  (fullName || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("") || "OW";

const normalizeText = (value) => (value || "").trim().toUpperCase();

const getOwnerTypeLabel = (value) => {
  const normalized = normalizeText(value);

  if (normalized === "BUSINESS") return "Doanh nghiệp";
  if (normalized === "INDIVIDUAL") return "Cá nhân";
  return value || "--";
};

const getResidencyTypeLabel = (value) => {
  const normalized = normalizeText(value);

  if (normalized === "TEMPORARY") return "Tạm trú";
  if (normalized === "PERMANENT") return "Thường trú";
  return value || "--";
};

const getStatusLabel = (value) => {
  const normalized = normalizeText(value);

  if (normalized === "APPROVED") return "Đã duyệt";
  if (normalized === "REJECTED") return "Bị từ chối";
  return "Chờ duyệt";
};

const exportOwnersCsv = (owners) => {
  const rows = [
    [
      "Ho va ten",
      "Email",
      "So dien thoai",
      "Thanh pho",
      "Loai hinh",
      "Loai cu tru",
      "Trang thai",
      "Ngay dang ky",
    ],
    ...owners.map((owner) => [
      owner.fullName || "",
      owner.email || "",
      owner.phone || "",
      owner.city || "",
      getOwnerTypeLabel(owner.ownerType),
      getResidencyTypeLabel(owner.residencyType),
      getStatusLabel(owner.verificationStatus),
      formatDate(owner.createdAt),
    ]),
  ];

  const csvContent = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = `owner-management-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
};

const OwnerManagementPage = () => {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [ownersPage, setOwnersPage] = useState(EMPTY_PAGE);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [detailOwner, setDetailOwner] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoadingSummary(true);
        const data = await getAdminOwnerSummary();
        setSummary(data || EMPTY_SUMMARY);
      } catch (fetchError) {
        setSummary(EMPTY_SUMMARY);
        setError(fetchError.message || "Không thể tải tổng quan chủ xe.");
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setIsLoadingTable(true);
        setError("");

        const fetcher = OWNER_FETCHERS[activeTab];
        const data = await fetcher({
          keyword,
          page,
          size: PAGE_SIZE,
        });

        setOwnersPage(data || EMPTY_PAGE);
      } catch (fetchError) {
        setOwnersPage(EMPTY_PAGE);
        setError(fetchError.message || "Không thể tải danh sách chủ xe.");
      } finally {
        setIsLoadingTable(false);
      }
    };

    fetchOwners();
  }, [activeTab, keyword, page]);

  const filteredOwners = useMemo(
    () => ownersPage.content || [],
    [ownersPage.content],
  );

  const visiblePages = buildPagination(page, ownersPage.totalPages || 0);
  const startItem =
    filteredOwners.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = startItem === 0 ? 0 : startItem + filteredOwners.length - 1;

  const statCards = [
    {
      label: "Tổng yêu cầu",
      value: summary.totalRequests,
      icon: "inventory_2",
      meta: "Tháng này",
      tone: "neutral",
    },
    {
      label: "Chờ duyệt",
      value: summary.pendingOwners,
      icon: "pending_actions",
      meta: "Yêu cầu mới",
      tone: "warning",
    },
    {
      label: "Đã duyệt",
      value: summary.approvedOwners,
      icon: "verified",
      meta:
        summary.totalRequests > 0
          ? `${Math.round((summary.approvedOwners / summary.totalRequests) * 100)}% tổng hồ sơ`
          : "0% tổng hồ sơ",
      tone: "success",
    },
    {
      label: "Bị từ chối",
      value: summary.rejectedOwners,
      icon: "block",
      meta:
        summary.totalRequests > 0
          ? `Tỷ lệ ${Math.round((summary.rejectedOwners / summary.totalRequests) * 1000) / 10}%`
          : "Tỷ lệ 0%",
      tone: "danger",
    },
  ];

  const refreshCurrentData = async (nextPage = page) => {
    const [summaryData, ownersData] = await Promise.all([
      getAdminOwnerSummary(),
      OWNER_FETCHERS[activeTab]({
        keyword,
        page: nextPage,
        size: PAGE_SIZE,
      }),
    ]);

    setSummary(summaryData || EMPTY_SUMMARY);
    setOwnersPage(ownersData || EMPTY_PAGE);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const handleOpenDetail = async (ownerId) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailError("");

    try {
      const detail = await getAdminOwnerDetail(ownerId);
      setDetailOwner(detail);
    } catch (fetchError) {
      setDetailOwner(null);
      setDetailError(fetchError.message || "Không thể tải chi tiết chủ xe.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!detailOwner?.id) return;

    try {
      setActionLoading("approve");
      setError("");
      await approveOwner(detailOwner.id);
      await refreshCurrentData();
      setIsDetailOpen(false);
      setDetailOwner(null);
    } catch (actionError) {
      setDetailError(actionError.message || "Không thể duyệt hồ sơ.");
    } finally {
      setActionLoading("");
    }
  };

  const openRejectModal = () => {
    setRejectReason(detailOwner?.reviewNote || "");
    setRejectError("");
    setIsRejectOpen(true);
  };

  const handleReject = async () => {
    if (!detailOwner?.id) return;

    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      setActionLoading("reject");
      setRejectError("");
      setError("");

      await rejectOwner(detailOwner.id, rejectReason.trim());
      setIsRejectOpen(false);
      await refreshCurrentData();
      setIsDetailOpen(false);
      setDetailOwner(null);
    } catch (actionError) {
      setRejectError(actionError.message || "Không thể từ chối hồ sơ.");
    } finally {
      setActionLoading("");
    }
  };

  const canApprove =
    normalizeText(detailOwner?.verificationStatus) !== "APPROVED";
  const canReject =
    normalizeText(detailOwner?.verificationStatus) !== "REJECTED";

  return (
    <div className="owner-management-page d-grid gap-4">
      <section className="owner-page-hero">
        <div>
          <h1 className="owner-page-title mb-2">Quản lý Chủ xe</h1>
          <p className="owner-page-subtitle mb-0">
            Quản lý và phê duyệt các đối tác chủ xe trên hệ thống
          </p>
        </div>

        <Button
          variant="light"
          className="owner-export-button"
          onClick={() => exportOwnersCsv(filteredOwners)}
          disabled={filteredOwners.length === 0}
        >
          <span className="material-symbols-outlined">download</span>
          Xuất báo cáo
        </Button>
      </section>

      <Row className="g-3">
        {statCards.map((card) => (
          <Col key={card.label} sm={6} xl={3}>
            <Card className={`owner-stat-card tone-${card.tone} border-0 shadow-sm h-100`}>
              <Card.Body>
                <div className="owner-stat-top">
                  <div className="owner-stat-icon">
                    <span className="material-symbols-outlined">
                      {card.icon}
                    </span>
                  </div>
                  <div className="owner-stat-meta">{card.meta}</div>
                </div>
                <div className="owner-stat-label">{card.label}</div>
                <div className="owner-stat-value">
                  {isLoadingSummary ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    formatNumber(card.value)
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {error ? <Alert variant="danger" className="mb-0">{error}</Alert> : null}

      <Card className="border-0 shadow-sm owner-table-shell">
        <Card.Body className="p-0">
          <div className="owner-tab-row">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const badgeCount =
                tab.key === "PENDING"
                  ? summary.pendingOwners
                  : tab.key === "APPROVED"
                    ? summary.approvedOwners
                    : summary.rejectedOwners;

              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`owner-status-tab ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(0);
                  }}
                >
                  <span>{tab.label}</span>
                  <Badge pill bg={isActive ? "success" : "light"} text={isActive ? undefined : "dark"}>
                    {formatNumber(badgeCount)}
                  </Badge>
                </button>
              );
            })}
          </div>

          <div className="owner-filter-bar">
            <Form onSubmit={handleSearchSubmit} className="owner-search-form">
              <Form.Control
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm theo tên, email hoặc số điện thoại"
              />
              <Button type="submit" className="btn-primary-custom px-4">
                Tìm kiếm
              </Button>
            </Form>

            <div className="owner-table-summary">
              Hiển thị {startItem}-{endItem} trên tổng số{" "}
              {formatNumber(ownersPage.totalElements)} kết quả
            </div>
          </div>

          <div className="table-responsive">
            <Table className="align-middle mb-0 owner-management-table">
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Liên hệ</th>
                  <th>Khu vực</th>
                  <th>Loại hình</th>
                  <th>Trạng thái</th>
                  <th>Ngày đăng ký</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTable ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      Không có hồ sơ chủ xe phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner.id}>
                      <td>
                        <div className="owner-name">{owner.fullName || "--"}</div>
                      </td>
                      <td>
                        <div className="owner-contact-primary">{owner.email || "--"}</div>
                        <div className="owner-contact-secondary">{owner.phone || "--"}</div>
                      </td>
                      <td className="owner-city">{owner.city || "--"}</td>
                      <td>
                        <div className="owner-chip-stack">
                          <span className="owner-soft-chip">
                            {getOwnerTypeLabel(owner.ownerType)}
                          </span>
                          <span className="owner-soft-chip muted">
                            {getResidencyTypeLabel(owner.residencyType)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`owner-status-pill status-${normalizeText(owner.verificationStatus).toLowerCase()}`}
                        >
                          <span className="owner-status-dot" />
                          {getStatusLabel(owner.verificationStatus)}
                        </span>
                      </td>
                      <td className="owner-date">{formatDate(owner.createdAt)}</td>
                      <td className="text-end">
                        <Button
                          variant="link"
                          className="owner-detail-button"
                          onClick={() => handleOpenDetail(owner.id)}
                        >
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <div className="owner-pagination-row">
            <Pagination className="mb-0 owner-pagination">
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
                disabled={page >= (ownersPage.totalPages || 0) - 1 || ownersPage.totalPages === 0}
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, (ownersPage.totalPages || 1) - 1),
                  )
                }
              />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={isDetailOpen}
        onHide={() => setIsDetailOpen(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết chủ xe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isDetailLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : detailError ? (
            <Alert variant="danger" className="mb-0">
              {detailError}
            </Alert>
          ) : detailOwner ? (
            <div className="owner-detail-layout">
              <div className="owner-detail-header">
                <div className="owner-detail-avatar">
                  {getInitials(detailOwner.fullName)}
                </div>
                <div>
                  <div className="owner-detail-name">
                    {detailOwner.fullName || "--"}
                  </div>
                </div>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Card className="owner-detail-card border-0">
                    <Card.Body>
                      <div className="owner-detail-card-title">Thông tin liên hệ</div>
                      <div className="owner-detail-pair"><span>Họ và tên</span><strong>{detailOwner.fullName || "--"}</strong></div>
                      <div className="owner-detail-pair compact"><span>Email</span><strong title={detailOwner.email || "--"}>{detailOwner.email || "--"}</strong></div>
                      <div className="owner-detail-pair compact"><span>Số điện thoại</span><strong>{detailOwner.phone || "--"}</strong></div>
                      <div className="owner-detail-pair"><span>Thành phố</span><strong>{detailOwner.city || "--"}</strong></div>
                      <div className="owner-detail-pair"><span>Địa chỉ</span><strong>{detailOwner.address || "--"}</strong></div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="owner-detail-card border-0">
                    <Card.Body>
                      <div className="owner-detail-card-title">Thông tin hồ sơ</div>
                      <div className="owner-detail-pair"><span>Loại hình</span><strong>{getOwnerTypeLabel(detailOwner.ownerType)}</strong></div>
                      <div className="owner-detail-pair"><span>Cư trú</span><strong>{getResidencyTypeLabel(detailOwner.residencyType)}</strong></div>
                      <div className="owner-detail-pair"><span>Số CCCD/CMND</span><strong>{detailOwner.idNumber || "--"}</strong></div>
                      <div className="owner-detail-pair"><span>Trạng thái</span><strong>{getStatusLabel(detailOwner.verificationStatus)}</strong></div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="owner-detail-card border-0 h-100">
                    <Card.Body>
                      <div className="owner-detail-card-title">Thông tin tài khoản</div>
                      <div className="owner-detail-pair"><span>Role</span><strong>{detailOwner.userRole || "--"}</strong></div>
                      <div className="owner-detail-pair"><span>Đã xác minh</span><strong>{detailOwner.userVerified ? "Có" : "Chưa"}</strong></div>
                      <div className="owner-detail-pair"><span>Đã khóa</span><strong>{detailOwner.userDeleted ? "Có" : "Không"}</strong></div>
                      <div className="owner-detail-pair compact"><span>Ngày tạo hồ sơ</span><strong>{formatDate(detailOwner.createdAt)}</strong></div>
                      <div className="owner-detail-pair compact"><span>Cập nhật gần nhất</span><strong>{formatDate(detailOwner.updatedAt)}</strong></div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="owner-detail-card border-0 h-100">
                    <Card.Body>
                      <div className="owner-detail-card-title">Ghi chú xét duyệt</div>
                      <div className="owner-review-note">
                        {detailOwner.reviewNote || "Chưa có ghi chú."}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="owner-detail-card border-0 h-100">
                    <Card.Body>
                      <div className="owner-detail-card-title">CCCD mặt trước</div>
                      {detailOwner.idCardFrontUrl ? (
                        <img
                          src={detailOwner.idCardFrontUrl}
                          alt="CCCD mặt trước"
                          className="owner-document-image"
                        />
                      ) : (
                        <div className="owner-document-empty">Không có ảnh</div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="owner-detail-card border-0 h-100">
                    <Card.Body>
                      <div className="owner-detail-card-title">CCCD mặt sau</div>
                      {detailOwner.idCardBackUrl ? (
                        <img
                          src={detailOwner.idCardBackUrl}
                          alt="CCCD mặt sau"
                          className="owner-document-image"
                        />
                      ) : (
                        <div className="owner-document-empty">Không có ảnh</div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="text-muted">Không có dữ liệu chi tiết.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setIsDetailOpen(false)}>
            Đóng
          </Button>
          {canReject ? (
            <Button
              variant="outline-danger"
              onClick={openRejectModal}
              disabled={actionLoading === "approve" || actionLoading === "reject"}
            >
              {actionLoading === "reject" ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Từ chối"
              )}
            </Button>
          ) : null}
          {canApprove ? (
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={actionLoading === "approve" || actionLoading === "reject"}
            >
              {actionLoading === "approve" ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Duyệt hồ sơ"
              )}
            </Button>
          ) : null}
        </Modal.Footer>
      </Modal>

      <Modal
        show={isRejectOpen}
        onHide={() => setIsRejectOpen(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Từ chối hồ sơ chủ xe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Lý do từ chối</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              maxLength={500}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Nhập lý do để chủ xe biết cần bổ sung hoặc chỉnh sửa gì."
            />
          </Form.Group>
          <div className="text-muted small mt-2">{rejectReason.length}/500 ký tự</div>
          {rejectError ? <Alert variant="danger" className="mt-3 mb-0">{rejectError}</Alert> : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setIsRejectOpen(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={actionLoading === "reject"}>
            {actionLoading === "reject" ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Xác nhận từ chối"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OwnerManagementPage;
