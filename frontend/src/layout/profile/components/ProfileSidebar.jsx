import { Badge, Card, ListGroup } from "react-bootstrap";

const navItems = [
  { key: "account", label: "Tài khoản của tôi", icon: "person" },
  { key: "favorites", label: "Xe yêu thích", icon: "favorite" },
  { key: "trips", label: "Chuyến của tôi", icon: "directions_car" },
  { key: "addresses", label: "Địa chỉ của tôi", icon: "location_on" },
  { key: "password", label: "Đổi mật khẩu", icon: "lock" },
  { key: "logout", label: "Đăng xuất", icon: "logout", isLogout: true },
];

const ProfileSidebar = ({ user, activeKey = "account", onSelect }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden dashboard-sidebar-card">
      <Card.Body className="p-4">
        <div className="d-flex flex-column align-items-start justify-content-center gap-2 mb-4 text-start">
          <img
            src={user.avatar}
            alt={user.name}
            width={56}
            height={56}
            className="rounded-circle object-fit-cover"
          />
          <div className="text-start">
            <h6 className="mb-1 fw-semibold">{user.name}</h6>
            <Badge className="badge-soft-primary border-0">{user.tier}</Badge>
          </div>
        </div>

        <ListGroup variant="flush" className="dashboard-nav-list">
          {navItems.map((item) => (
            <ListGroup.Item
              key={item.key}
              action
              onClick={() => onSelect?.(item.key)}
              className={`border-0 rounded-3 px-3 py-2 mb-1 d-flex align-items-center gap-2 ${
                item.key === activeKey ? "dashboard-nav-active" : "text-muted"
              } ${
                item.isLogout
                  ? "profile-nav-logout text-danger mt-2 rounded-0"
                  : ""
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

export default ProfileSidebar;
