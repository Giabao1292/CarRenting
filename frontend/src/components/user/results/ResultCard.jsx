import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";

const getCardSpecs = (car) => {
  if (Array.isArray(car.specs) && car.specs.length) {
    return car.specs;
  }

  return [
    {
      icon: "person",
      value: String(car.seats || "5").replace(/[^0-9]/g, "") || "5",
      label: "Chỗ",
    },
    {
      icon: "tune",
      value: car.trans || "Số tự động",
      label: "Hộp số",
    },
    {
      icon: "local_gas_station",
      value: car.fuel || "Xăng",
      label: "Nhiên liệu",
    },
  ];
};

const getDisplayPrice = (car) => {
  return car.displayPrice || car.price || "490K";
};

const getDisplayOldPrice = (car) => {
  return car.displayOldPrice || car.oldPrice || "";
};

const getRatingValue = (car) => {
  const value = Number(car.rating);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.min(5, value);
};

const ResultCard = ({ car }) => {
  const navigate = useNavigate();
  const specs = getCardSpecs(car);
  const displayPrice = getDisplayPrice(car);
  const displayOldPrice = getDisplayOldPrice(car);
  const priceUnit = car.priceUnit || "/4h";
  const pickupLabel = car.pickupLabel || "Tự nhận xe";
  const flashLabel = car.flashLabel || "Flash Sale";
  const locationLabel = car.location || "Quận Cẩm Lệ";
  const ratingValue = getRatingValue(car);

  const handleOpenCarDetails = () => {
    navigate(APP_ROUTES.CAR_DETAILS);
  };

  return (
    <Card
      className="result-car-card"
      role="button"
      onClick={handleOpenCarDetails}
    >
      <div className="result-car-card__image-wrap">
        <img
          src={car.image}
          alt={car.title}
          className="result-car-card__image"
        />

        <div className="result-car-card__flash-badge">
          <span className="material-symbols-outlined">bolt</span>
          {flashLabel}
        </div>

        <div className="result-car-card__pickup-badge">
          <span className="material-symbols-outlined">check_circle</span>
          {pickupLabel}
        </div>
      </div>

      <Card.Body className="result-car-card__body">
        <h3 className="result-car-card__title">{car.title}</h3>

        {ratingValue !== null ? (
          <div
            className="result-car-card__rating-row"
            aria-label={`Đánh giá ${ratingValue.toFixed(1)} trên 5`}
          >
            <span className="material-symbols-outlined result-car-card__rating-star">
              star
            </span>
            <span className="result-car-card__rating-value">
              {ratingValue.toFixed(1)}
            </span>
            <span className="result-car-card__rating-max">/5</span>
          </div>
        ) : null}

        <p className="result-car-card__location">{locationLabel}</p>

        <div className="result-car-card__price-wrap">
          <span className="result-car-card__old-price">
            {displayOldPrice || "\u00A0"}
          </span>
          <div className="result-car-card__new-price-row">
            <span className="result-car-card__new-price">{displayPrice}</span>
            <span className="result-car-card__unit">{priceUnit}</span>
          </div>
        </div>
      </Card.Body>

      <div className="result-car-card__spec-row">
        {specs.map((spec) => (
          <div
            key={`${car.title}-${spec.label}`}
            className="result-car-card__spec-item"
          >
            <span className="material-symbols-outlined result-car-card__spec-icon">
              {spec.icon}
            </span>
            <div className="result-car-card__spec-value">{spec.value}</div>
            <div className="result-car-card__spec-label">{spec.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ResultCard;
