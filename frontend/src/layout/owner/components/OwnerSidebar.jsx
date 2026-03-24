import { Badge, Card, ListGroup } from "react-bootstrap";

const sideItems = [
  { label: "Overview", icon: "dashboard", active: true },
  { label: "Bookings", icon: "calendar_month", badge: "3" },
  { label: "My Fleet", icon: "directions_car" },
  { label: "Messages", icon: "chat_bubble" },
  { label: "Earnings", icon: "payments" },
  { label: "Support", icon: "help" },
];

const OwnerSidebar = ({ user }) => {
  const displayName = user?.name || user?.email || "Chủ xe";
  const displayRole = user?.role || "OWNER";

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden owner-sidebar-card h-100">
      <Card.Body className="p-4 d-flex flex-column">
        <div className="d-flex align-items-center gap-3 mb-4">
          <img
            src={user?.avatar}
            alt={displayName}
            width={56}
            height={56}
            className="rounded-circle object-fit-cover"
          />
          <div>
            <h6 className="fw-bold mb-1">{displayName}</h6>
            <Badge className="badge-soft-primary border-0">{displayRole}</Badge>
          </div>
        </div>

        <ListGroup variant="flush" className="owner-nav-list mb-4">
          {sideItems.map((item) => (
            <ListGroup.Item
              key={item.label}
              action
              className={`border-0 rounded-3 px-3 py-2 mb-1 d-flex align-items-center gap-2 fw-semibold ${
                item.active ? "owner-nav-active" : "text-muted"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
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
          ))}
        </ListGroup>

        <div className="mt-auto rounded-4 p-3 owner-tip-card text-white">
          <small className="d-block opacity-75">Pro Tip</small>
          <div className="fw-bold mb-2">Clean cars get 20% more bookings.</div>
          <button className="btn btn-link p-0 text-success fw-bold text-decoration-none">
            Read Guide
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default OwnerSidebar;
