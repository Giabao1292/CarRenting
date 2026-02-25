import { Badge, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";

const ResultCard = ({ car }) => {
  const navigate = useNavigate();

  const handleOpenCarDetails = () => {
    navigate(APP_ROUTES.CAR_DETAILS);
  };

  return (
    <Card
      className="border-0 shadow-sm card-hover h-100 rounded-4 overflow-hidden"
      role="button"
      onClick={handleOpenCarDetails}
      style={{ cursor: "pointer" }}
    >
      <div
        className="position-relative overflow-hidden"
        style={{ height: 190 }}
      >
        <div
          className="w-100 h-100"
          style={{
            backgroundImage: `url(${car.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Button
          variant="light"
          size="sm"
          className="position-absolute top-2 end-2 rounded-circle border-0 shadow-sm"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="material-symbols-outlined">favorite</span>
        </Button>

        {car.oldPrice ? (
          <div className="position-absolute top-2 start-2 bg-white px-2 py-1 rounded-2 fw-bold text-uppercase small">
            Top Rated
          </div>
        ) : null}
      </div>

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Card.Title className="fw-bold mb-1">{car.title}</Card.Title>
            <div className="d-flex align-items-center gap-1 text-muted small">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: 18 }}
              >
                star
              </span>
              <span className="fw-bold text-body">{car.rating}</span>
              <span>({car.trips} trips)</span>
            </div>
          </div>

          {car.tag ? (
            <Badge
              bg=""
              className="badge-soft-primary text-uppercase fw-bold small"
            >
              {car.tag}
            </Badge>
          ) : null}
        </div>

        <div className="d-flex align-items-center gap-4 py-3 border-top border-bottom mb-4">
          <div className="text-center">
            <span
              className="material-symbols-outlined text-muted"
              style={{ fontSize: 20 }}
            >
              airline_seat_recline_normal
            </span>
            <div className="small text-muted-soft">{car.seats}</div>
          </div>
          <div className="text-center">
            <span
              className="material-symbols-outlined text-muted"
              style={{ fontSize: 20 }}
            >
              {car.fuel === "Electric" ? "electric_bolt" : "local_gas_station"}
            </span>
            <div className="small text-muted-soft">{car.fuel}</div>
          </div>
          <div className="text-center">
            <span
              className="material-symbols-outlined text-muted"
              style={{ fontSize: 20 }}
            >
              settings_suggest
            </span>
            <div className="small text-muted-soft">{car.trans}</div>
          </div>
        </div>

        <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
          <div>
            {car.oldPrice ? (
              <div className="small text-muted-soft text-decoration-line-through">
                {car.oldPrice}
              </div>
            ) : (
              <div className="small text-muted-soft">&nbsp;</div>
            )}
            <div className="d-flex align-items-baseline gap-1">
              <span className="fs-4 fw-bold">{car.price}</span>
              <span className="small text-muted-soft">/ day</span>
            </div>
          </div>

          <Button
            className={
              car.cta === "Rent Now"
                ? "btn-primary-custom px-4 fw-bold"
                : "bg-white border px-4 fw-semibold"
            }
            onClick={handleOpenCarDetails}
          >
            {car.cta}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ResultCard;
