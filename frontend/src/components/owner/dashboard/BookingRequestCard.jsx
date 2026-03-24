import { Button, Card } from "react-bootstrap";

const BookingRequestCard = ({ request }) => {
  const bookingLabel = request.bookingId
    ? `#${String(request.bookingId).slice(0, 8)}`
    : "Mới";

  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Body className="p-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div className="d-flex align-items-start gap-3">
          {request.imageUrl ? (
            <img
              src={request.imageUrl}
              alt={request.vehicleName}
              width={56}
              height={56}
              className="rounded-3 object-fit-cover"
            />
          ) : (
            <div
              className="rounded-3 bg-light d-flex align-items-center justify-content-center"
              style={{ width: 56, height: 56 }}
            >
              <span className="material-symbols-outlined text-muted">
                directions_car
              </span>
            </div>
          )}
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h6 className="fw-bold mb-0">{request.vehicleName}</h6>
              <span className="badge text-bg-light text-muted">
                {bookingLabel}
              </span>
            </div>
            <div className="small text-muted mb-1">
              Khách thuê:{" "}
              <span className="fw-semibold text-dark">
                {request.customerEmail}
              </span>
            </div>
            <div className="small text-muted mb-1">
              Nhận xe:{" "}
              <span className="fw-semibold text-dark">{request.pickupAt}</span>
            </div>
            <div className="small text-muted mb-1">
              Trả xe:{" "}
              <span className="fw-semibold text-dark">{request.dropoffAt}</span>
            </div>
            <div className="small fw-bold text-success">
              {request.totalAmount}
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="fw-semibold">
            Từ chối
          </Button>
          <Button className="btn-primary-custom fw-bold">Chấp nhận</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookingRequestCard;
