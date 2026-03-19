import { Badge, Card, Form } from "react-bootstrap";

const statusVariant = {
  Available: "success",
  "On Trip": "primary",
  Offline: "secondary",
};

const FleetItemCard = ({ car }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Body className="d-flex align-items-center gap-3 p-3">
        <div
          className="rounded-3 bg-light d-flex align-items-center justify-content-center"
          style={{ width: 70, height: 56 }}
        >
          <span className="material-symbols-outlined text-muted">
            directions_car
          </span>
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <h6 className="fw-bold mb-1">{car.name}</h6>
            <Form.Check
              type="switch"
              defaultChecked={car.status !== "Offline"}
            />
          </div>
          <div className="small text-muted mb-1">License: {car.plate}</div>
          <div className="d-flex align-items-center gap-2">
            <Badge bg={statusVariant[car.status] || "secondary"}>
              {car.status}
            </Badge>
            <small className="text-muted fw-semibold">{car.extra}</small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FleetItemCard;
