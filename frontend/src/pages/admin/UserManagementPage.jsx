import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  InputGroup,
  Modal,
  Pagination,
  Row,
  Col,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  getCustomers,
  getUserDashboard,
  toggleCustomerBlockStatus,
} from "../../services/admin/adminUsersService";
import "../../style/admin/UserManagement.css";

const PAGE_SIZE = 10;

const emptyDashboard = {
  totalUsers: 0,
  activeUsers: 0,
  blockedUsers: 0,
  verifiedUsers: 0,
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(value ?? 0);

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

const UserManagementPage = () => {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [customers, setCustomers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState("");

  const dashboardCards = useMemo(() => {
    const totalUsers = dashboard.totalUsers || 0;
    const activeRate = totalUsers
      ? Math.round((dashboard.activeUsers / totalUsers) * 100)
      : 0;
    const blockedRate = totalUsers
      ? Math.round((dashboard.blockedUsers / totalUsers) * 100)
      : 0;
    const verifiedRate = totalUsers
      ? Math.round((dashboard.verifiedUsers / totalUsers) * 100)
      : 0;

    return [
      {
        label: "Total Customers",
        value: formatNumber(dashboard.totalUsers),
        meta: `${activeRate}% active`,
        icon: "groups",
        tone: "primary",
      },
      {
        label: "Active Customers",
        value: formatNumber(dashboard.activeUsers),
        meta: `${activeRate}% of total`,
        icon: "check_circle",
        tone: "success",
      },
      {
        label: "Blocked Customers",
        value: formatNumber(dashboard.blockedUsers),
        meta: `${blockedRate}% of total`,
        icon: "block",
        tone: "danger",
      },
      {
        label: "Verified Customers",
        value: formatNumber(dashboard.verifiedUsers),
        meta: `${verifiedRate}% verified`,
        icon: "verified",
        tone: "emerald",
      },
    ];
  }, [dashboard]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoadingDashboard(true);
        const data = await getUserDashboard();
        setDashboard(data);
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load user dashboard");
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoadingTable(true);
        setError("");

        const data = await getCustomers({
          keyword,
          page,
          size: PAGE_SIZE,
        });

        setCustomers(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } catch (fetchError) {
        setCustomers([]);
        setTotalPages(0);
        setTotalElements(0);
        setError(fetchError.message || "Unable to load customers");
      } finally {
        setIsLoadingTable(false);
      }
    };

    fetchCustomers();
  }, [keyword, page]);

  const refreshData = async () => {
    const [dashboardData, customersData] = await Promise.all([
      getUserDashboard(),
      getCustomers({
        keyword,
        page,
        size: PAGE_SIZE,
      }),
    ]);

    setDashboard(dashboardData);
    setCustomers(customersData.content || []);
    setTotalPages(customersData.totalPages || 0);
    setTotalElements(customersData.totalElements || 0);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const handleOpenStatusModal = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseStatusModal = () => {
    if (actionLoadingId !== null) return;
    setSelectedCustomer(null);
  };

  const handleToggleBlock = async () => {
    if (!selectedCustomer) return;

    try {
      setActionLoadingId(selectedCustomer.id);
      setError("");

      await toggleCustomerBlockStatus({
        id: selectedCustomer.id,
        isDeleted: selectedCustomer.isDeleted,
      });

      await refreshData();
      setSelectedCustomer(null);
    } catch (actionError) {
      setError(actionError.message || "Unable to update customer status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const startItem = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = Math.min((page + 1) * PAGE_SIZE, totalElements);
  const visiblePages = buildPagination(page, totalPages);
  const isSelectedCustomerBlocked = Boolean(selectedCustomer?.isDeleted);
  const statusActionLabel = isSelectedCustomerBlocked ? "unblock" : "block";

  return (
    <>
      <div className="d-flex flex-column gap-2 mb-4">
        <h1 className="fw-bold display-5 mb-0">User Management</h1>
        <p className="text-muted fs-5 mb-0">
          Manage customer access, review verification status, and control
          account activity.
        </p>
      </div>

      <Row className="g-3 mb-4">
        {dashboardCards.map((card) => (
          <Col key={card.label} sm={6} xl={3}>
            <Card
              className={`border-0 shadow-sm rounded-4 h-100 user-stat-card tone-${card.tone}`}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <div className="text-uppercase small fw-bold text-secondary user-stat-label">
                      {card.label}
                    </div>
                    <div className="display-4 fw-bold text-dark mt-3 mb-0">
                      {isLoadingDashboard ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        card.value
                      )}
                    </div>
                  </div>
                  <div className="user-stat-icon">
                    <span className="material-symbols-outlined">
                      {card.icon}
                    </span>
                  </div>
                </div>
                <div className="user-stat-meta">{card.meta}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-4 border-bottom">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="user-table-chip">All Users</div>
              <Badge bg="light" text="dark" pill className="px-3 py-2">
                {formatNumber(totalElements)} customers
              </Badge>
            </div>

            <Form onSubmit={handleSearchSubmit} className="w-100 w-lg-auto">
              <InputGroup className="user-search-group">
                <InputGroup.Text className="bg-white border-end-0">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    search
                  </span>
                </InputGroup.Text>
                <Form.Control
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, email, or phone"
                  className="border-start-0 border-end-0"
                />
                <Button type="submit" className="btn-primary-custom px-4">
                  Search
                </Button>
              </InputGroup>
            </Form>
          </div>
        </Card.Body>

        {error && (
          <div className="px-4 pt-3">
            <div className="alert alert-danger mb-0">{error}</div>
          </div>
        )}

        <div className="table-responsive">
          <Table className="align-middle mb-0 user-management-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Verified</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTable ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const isBlocked = Boolean(customer.isDeleted);

                  return (
                    <tr key={customer.id}>
                      <td>
                        <div className="fw-bold fs-5 lh-sm">
                          {customer.fullName || "--"}
                        </div>
                        <div className="text-muted small mt-1">
                          ID #{customer.id}
                        </div>
                      </td>
                      <td className="fw-semibold text-secondary">
                        {customer.email || "--"}
                      </td>
                      <td className="fw-semibold text-secondary">
                        {customer.phone || "--"}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${customer.verified ? "status-verified" : "status-unverified"}`}
                        >
                          <span className="material-symbols-outlined">
                            {customer.verified ? "verified" : "hourglass"}
                          </span>
                          {customer.verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${isBlocked ? "status-blocked" : "status-active"}`}
                        >
                          <span className="status-dot" />
                          {isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="text-end">
                        <Button
                          variant={isBlocked ? "success" : "danger"}
                          className={`px-3 fw-semibold user-action-button ${
                            isBlocked
                              ? "user-action-unlock"
                              : "user-action-block"
                          }`}
                          disabled={actionLoadingId === customer.id}
                          onClick={() => handleOpenStatusModal(customer)}
                        >
                          {actionLoadingId === customer.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : isBlocked ? (
                            <>
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 18 }}
                              >
                                lock_open
                              </span>
                              Unblock
                            </>
                          ) : (
                            <>
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 18 }}
                              >
                                block
                              </span>
                              Block
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <Card.Body className="p-4 border-top">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div className="fw-semibold text-secondary">
              Showing {startItem}-{endItem} of {formatNumber(totalElements)}{" "}
              users
            </div>

            <Pagination className="mb-0 user-pagination">
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
                disabled={page >= totalPages - 1 || totalPages === 0}
                onClick={() =>
                  setPage((current) => Math.min(current + 1, totalPages - 1))
                }
              />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={Boolean(selectedCustomer)}
        onHide={handleCloseStatusModal}
        centered
      >
        <Modal.Header closeButton={actionLoadingId === null}>
          <Modal.Title className="text-capitalize">
            Confirm {statusActionLabel} user
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCustomer && (
            <p className="mb-0">
              Are you sure you want to {statusActionLabel}{" "}
              <strong>
                {selectedCustomer.fullName ||
                  selectedCustomer.email ||
                  `user #${selectedCustomer.id}`}
              </strong>
              ?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleCloseStatusModal}
            disabled={actionLoadingId !== null}
          >
            Cancel
          </Button>
          <Button
            variant={isSelectedCustomerBlocked ? "success" : "danger"}
            onClick={handleToggleBlock}
            disabled={actionLoadingId !== null}
          >
            {actionLoadingId !== null ? (
              <Spinner animation="border" size="sm" />
            ) : isSelectedCustomerBlocked ? (
              "Unblock"
            ) : (
              "Block"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserManagementPage;
