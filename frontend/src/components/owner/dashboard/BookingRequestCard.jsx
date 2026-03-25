import { Button, Card } from "react-bootstrap";

const BookingRequestCard = ({ request, manageHref }) => {
  const statusLabel = String(request.status || "inactive").toUpperCase();

  return (
    <Card className="border-0 shadow-sm rounded-4 owner-vehicle-card">
      <Card.Body className="owner-vehicle-card-body p-4 p-md-5 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 gap-md-4">
        <div className="d-flex align-items-start gap-3 gap-md-4">
          {request.imageUrl ? (
            <img
              src={request.imageUrl}
              alt={request.vehicleName}
              width={108}
              height={108}
              className="rounded-3 object-fit-cover owner-vehicle-card-image"
            />
          ) : (
            <div className="rounded-3 bg-light d-flex align-items-center justify-content-center owner-vehicle-card-image-placeholder">
              <span className="material-symbols-outlined text-muted owner-vehicle-card-image-icon">
                directions_car
              </span>
            </div>
          )}
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h5 className="fw-bold mb-0">{request.vehicleName}</h5>
              <span className="badge text-bg-light text-muted">
                {statusLabel}
              </span>
            </div>
            <div className="text-muted">
              Quản lý xe để cập nhật thông tin và trạng thái.
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button
            as="a"
            href={manageHref || "#"}
            className="btn-primary-custom fw-bold"
          >
            Quản lý
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookingRequestCard;
