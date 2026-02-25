import { Badge, Card } from "react-bootstrap";

const AdminStatCard = ({ stat }) => {
  return (
    <Card
      className={`border-0 shadow-sm rounded-4 h-100 admin-stat-card ${
        stat.highlight ? "admin-stat-highlight" : ""
      }`}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="admin-stat-icon-wrap">
            <span className="material-symbols-outlined">{stat.icon}</span>
          </div>
          <Badge bg={stat.highlight ? "warning" : "success"} text="dark">
            {stat.trend}
          </Badge>
        </div>
        <div className="small text-muted fw-semibold">{stat.label}</div>
        <h3 className="fw-bold mt-1 mb-0">{stat.value}</h3>
      </Card.Body>
    </Card>
  );
};

export default AdminStatCard;
