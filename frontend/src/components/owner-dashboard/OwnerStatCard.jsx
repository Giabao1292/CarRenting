import { Card } from "react-bootstrap";

const OwnerStatCard = ({ stat }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4 h-100 owner-stat-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div className="small text-muted fw-semibold">{stat.label}</div>
          <span className="material-symbols-outlined text-success owner-stat-icon">
            {stat.icon}
          </span>
        </div>
        <h3 className="fw-bold mt-3 mb-1">{stat.value}</h3>
        <div className="small fw-semibold text-success">{stat.trend}</div>
      </Card.Body>
    </Card>
  );
};

export default OwnerStatCard;
