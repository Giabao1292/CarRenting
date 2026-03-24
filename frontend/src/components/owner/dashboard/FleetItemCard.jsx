import { Badge, Card, Form } from "react-bootstrap";

const statusVariant = {
  available: "primary",
  rented: "success",
  inactive: "secondary",
  pending: "warning",
  rejected: "danger",
};

const statusLabel = {
  available: "Available",
  rented: "Rented",
  inactive: "Inactive",
  pending: "Pending",
  rejected: "Rejected",
};

const formatCurrencyVnd = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "0 VND/ngày";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)}/ngày`;
};

const FleetItemCard = ({ car, onToggleStatus, isUpdating = false }) => {
  const normalizedStatus = String(car.status || "inactive").toLowerCase();

  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Body className="d-flex align-items-center gap-3 p-3">
        <div
          className="rounded-3 bg-light d-flex align-items-center justify-content-center"
          style={{ width: 70, height: 56 }}
        >
          {car.imageUrl ? (
            <img
              src={car.imageUrl}
              alt={car.name}
              width={70}
              height={56}
              className="rounded-3 object-fit-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-muted">
              directions_car
            </span>
          )}
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <h6 className="fw-bold mb-1">{car.name}</h6>
            <Form.Check
              type="switch"
              checked={normalizedStatus !== "inactive"}
              disabled={isUpdating}
              onChange={() => onToggleStatus?.(car)}
            />
          </div>
          <div className="small text-muted mb-1">
            Giá: {formatCurrencyVnd(car.pricePerDay)}
          </div>
          <div className="d-flex align-items-center gap-2">
            <Badge bg={statusVariant[normalizedStatus] || "secondary"}>
              {statusLabel[normalizedStatus] || "Unknown"}
            </Badge>
            <small className="text-muted fw-semibold">
              Rating: {Number(car.rating || 0).toFixed(1)}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FleetItemCard;
