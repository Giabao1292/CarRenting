import { Link, useLocation } from "react-router-dom";
import { Badge, Button, Card, ListGroup } from "react-bootstrap";
import { APP_ROUTES } from "../../../app/routes";

const menuGroups = [
  {
    title: "Main Menu",
    items: [
      { label: "Overview", icon: "dashboard", to: APP_ROUTES.ADMIN_DASHBOARD },
      { label: "Car Approvals", icon: "directions_car", badge: "18" },
      { label: "Active Rentals", icon: "key" },
      {
        label: "User Management",
        icon: "group",
        to: APP_ROUTES.ADMIN_USERS,
      },
      { label: "Booking Management", icon: "book_online" },
      {
        label: "Payment Management",
        icon: "account_balance_wallet",
        to: APP_ROUTES.ADMIN_PAYMENTS,
      },
      {
        label: "Review",
        icon: "rate_review",
        to: APP_ROUTES.ADMIN_REVIEWS,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Transactions", icon: "payments" },
      { label: "Invoices", icon: "receipt_long" },
    ],
  },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <Card className="border-0 shadow-sm rounded-4 admin-sidebar-card h-100">
      <Card.Body className="p-3 d-flex flex-column gap-3">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <small className="text-uppercase text-muted fw-bold px-2 d-block mb-2">
              {group.title}
            </small>
            <ListGroup variant="flush" className="admin-nav-list">
              {group.items.map((item) => {
                const isActive = item.to && location.pathname === item.to;

                return (
                  <ListGroup.Item
                    key={item.label}
                    as={item.to ? Link : "div"}
                    to={item.to}
                    action={Boolean(item.to)}
                    className={`border-0 rounded-3 px-3 py-2 mb-1 d-flex align-items-center gap-2 fw-semibold ${
                      isActive ? "admin-nav-active" : "text-muted"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 19 }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge bg="success" pill className="ms-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </div>
        ))}

        <Card className="border mt-auto">
          <Card.Body>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="p-2 rounded-circle bg-success-subtle">
                <span
                  className="material-symbols-outlined text-success"
                  style={{ fontSize: 18 }}
                >
                  support_agent
                </span>
              </div>
              <div>
                <div className="fw-bold small">Need Help?</div>
                <small className="text-muted">Contact Support</small>
              </div>
            </div>
            <Button variant="outline-secondary" className="w-100 fw-semibold">
              Open Ticket
            </Button>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
};

export default AdminSidebar;
