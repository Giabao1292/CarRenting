import { Badge, Card, ListGroup } from "react-bootstrap";

const navItems = [
  { label: "Dashboard", icon: "dashboard", active: true },
  { label: "My Trips", icon: "directions_car" },
  { label: "Saved Cars", icon: "favorite" },
  { label: "Messages", icon: "chat" },
  { label: "Payment Methods", icon: "credit_card" },
  { label: "Settings", icon: "settings" },
];

const DashboardSidebar = ({ user }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden dashboard-sidebar-card">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <img
            src={user.avatar}
            alt={user.name}
            width={56}
            height={56}
            className="rounded-circle object-fit-cover"
          />
          <div>
            <h6 className="mb-1 fw-bold">{user.name}</h6>
            <Badge className="badge-soft-primary border-0">{user.tier}</Badge>
          </div>
        </div>

        <ListGroup variant="flush" className="dashboard-nav-list">
          {navItems.map((item) => (
            <ListGroup.Item
              key={item.label}
              action
              className={`border-0 rounded-3 px-3 py-2 mb-1 d-flex align-items-center gap-2 fw-semibold ${
                item.active ? "dashboard-nav-active" : "text-muted"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                {item.icon}
              </span>
              {item.label}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default DashboardSidebar;
