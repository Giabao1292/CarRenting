import { Button, Card } from "react-bootstrap";

const BookingRequestCard = ({ request }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Body className="p-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div className="d-flex align-items-start gap-3">
          <img
            src={request.image}
            alt={request.car}
            width={56}
            height={56}
            className="rounded-3 object-fit-cover"
          />
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h6 className="fw-bold mb-0">{request.car}</h6>
              <span className="badge text-bg-light text-muted">
                {request.dates}
              </span>
            </div>
            <div className="small text-muted mb-1">
              Requested by{" "}
              <span className="fw-semibold text-dark">{request.renter}</span> •{" "}
              {request.rating} ★
            </div>
            <div className="small fw-bold text-success">{request.earnings}</div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="fw-semibold">
            Decline
          </Button>
          <Button className="btn-primary-custom fw-bold">Accept</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookingRequestCard;
