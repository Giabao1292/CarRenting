import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";

const BookingSummaryCard = ({ booking }) => {
  const navigate = useNavigate();

  const handlePayNow = () => {
    navigate(APP_ROUTES.BOOKING_SUCCESS);
  };

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      <div
        style={{
          height: 180,
          backgroundImage: `url(${booking.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Card.Body className="d-flex flex-column gap-3">
        <div>
          <small className="text-muted">{booking.className}</small>
          <h5 className="fw-bold mb-0">{booking.carName}</h5>
        </div>

        <div className="border-top border-bottom py-3 d-grid gap-3">
          <div className="d-flex gap-2">
            <span className="material-symbols-outlined text-success">
              calendar_month
            </span>
            <div>
              <small className="text-muted d-block">Pick-up</small>
              <strong>{booking.pickup}</strong>
              <div className="text-muted small">{booking.location}</div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <span className="material-symbols-outlined text-success">
              event_available
            </span>
            <div>
              <small className="text-muted d-block">Drop-off</small>
              <strong>{booking.dropoff}</strong>
              <div className="text-muted small">{booking.location}</div>
            </div>
          </div>
        </div>

        <div className="d-grid gap-2">
          {booking.breakdown.map((item) => (
            <div
              key={item.label}
              className="d-flex justify-content-between small"
            >
              <span className={item.isDiscount ? "text-success" : "text-muted"}>
                {item.label}
              </span>
              <span
                className={
                  item.isDiscount ? "text-success fw-semibold" : "fw-medium"
                }
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="border-top pt-2 d-flex justify-content-between align-items-end">
          <div>
            <small className="text-muted">Total due today</small>
            <div className="fs-4 fw-bold">{booking.total}</div>
          </div>
          <small className="text-muted">USD</small>
        </div>

        <Button
          className="btn-primary-custom py-3 fw-bold"
          onClick={handlePayNow}
        >
          Pay {booking.total}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default BookingSummaryCard;
