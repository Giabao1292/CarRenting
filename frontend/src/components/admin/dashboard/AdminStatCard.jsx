import { Badge, Card } from "react-bootstrap";

const AdminStatCard = ({ stat }) => {
  return (
    <Card
      className={`border-0 shadow-sm rounded-4 h-100 admin-stat-card ${
        stat.highlight ? "admin-stat-highlight" : ""
      }`}
    >
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="admin-stat-icon-wrap">
            <span className="material-symbols-outlined">{stat.icon}</span>
          </div>
          {stat.trend ? (
            <Badge bg={stat.highlight ? "warning" : "success"} text="dark">
              {stat.trend}
            </Badge>
          ) : null}
        </div>
        <div className="small text-muted fw-semibold">{stat.label}</div>
        <h3 className="fw-bold mt-2 mb-0 admin-overview-stat-value">
          {stat.value}
        </h3>
        {stat.meta ? (
          <div className="admin-overview-stat-meta mt-3">{stat.meta}</div>
        ) : null}
      </Card.Body>
    </Card>
  );
};

export default AdminStatCard;
