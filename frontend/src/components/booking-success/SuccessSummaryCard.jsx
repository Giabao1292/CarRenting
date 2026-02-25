import { Badge, Button, Card } from "react-bootstrap";

const SuccessSummaryCard = ({ data }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="p-4 border-bottom">
        <h5 className="fw-bold mb-3">Order Summary</h5>
        <div className="rounded-3 overflow-hidden border">
          <div
            style={{
              height: 180,
              backgroundImage: `url(${data.car.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="p-3 bg-white">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong>{data.car.name}</strong>
                <div className="small text-muted">{data.car.subtitle}</div>
              </div>
              <Badge
                bg="light"
                text="dark"
                className="d-flex align-items-center gap-1"
              >
                <span
                  className="material-symbols-outlined text-success"
                  style={{ fontSize: 16 }}
                >
                  star
                </span>
                {data.car.rating}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Card.Body>
        <div className="d-grid gap-3 small">
          <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Pick-up Date</span>
            <strong>{data.summary.pickupDate}</strong>
          </div>
          <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Return Date</span>
            <strong>{data.summary.returnDate}</strong>
          </div>
          <div className="d-flex justify-content-between border-bottom pb-2">
            <span className="text-muted">Pickup Location</span>
            <strong>{data.summary.location}</strong>
          </div>
          <div className="d-flex justify-content-between fs-5">
            <span className="fw-semibold">Total Price</span>
            <strong>{data.summary.total}</strong>
          </div>
        </div>
      </Card.Body>

      <div className="px-3 pb-3">
        <Button className="w-100 btn-primary-custom fw-bold">
          View My Booking
        </Button>
      </div>
    </Card>
  );
};

export default SuccessSummaryCard;
