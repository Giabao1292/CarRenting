import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";

const BookingCard = ({ car }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(APP_ROUTES.PAYMENT);
  };

  return (
    <Card
      className="border-0 shadow-sm rounded-4 p-3 position-sticky"
      style={{ top: 90 }}
    >
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <span className="fs-3 fw-bold">${car.pricePerDay}</span>
          <span className="text-muted"> / day</span>
        </div>
        <small className="text-decoration-line-through text-muted">
          ${car.oldPricePerDay}
        </small>
      </div>

      <div className="border rounded-3 overflow-hidden mb-3">
        <div className="d-flex border-bottom">
          <div className="p-2 flex-fill border-end">
            <small className="text-muted d-block">Trip Start</small>
            <strong>Oct 24, 10:00 AM</strong>
          </div>
          <div className="p-2 flex-fill">
            <small className="text-muted d-block">Trip End</small>
            <strong>Oct 27, 10:00 AM</strong>
          </div>
        </div>
        <div className="p-2">
          <small className="text-muted d-block">Pickup & Return</small>
          <strong>San Francisco International Airport</strong>
        </div>
      </div>

      <Button
        className="btn-primary-custom w-100 py-2 mb-2"
        onClick={handleBookNow}
      >
        Book Now
      </Button>
      <div className="text-center text-muted small mb-3">
        You won't be charged yet
      </div>

      <div className="d-flex justify-content-between small mb-1">
        <span>$89 x 3 days</span>
        <span>$267</span>
      </div>
      <div className="d-flex justify-content-between small mb-1">
        <span>Trip fee</span>
        <span>$24</span>
      </div>
      <div className="d-flex justify-content-between small mb-3 text-success">
        <span>Early bird discount</span>
        <span>-$15</span>
      </div>

      <div className="d-flex justify-content-between border-top pt-2 fw-bold">
        <span>Total</span>
        <span>${car.totalPrice}</span>
      </div>
    </Card>
  );
};

export default BookingCard;
