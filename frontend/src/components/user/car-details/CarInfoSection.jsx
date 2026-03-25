import { useEffect, useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";

const featureIcon = {
  Bluetooth: "bluetooth",
  "Backup Camera": "videocam",
  "GPS Navigation": "location_on",
  "Heated Seats": "heat",
  "Keyless Entry": "key",
  "USB Charger": "usb",
  Autopilot: "assistant_navigation",
  "Toll Pass": "toll",
};

const specIcon = {
  "5 Seats": "airline_seat_recline_normal",
  Electric: "electric_car",
  "3.1s 0-60": "speed",
  "Self-Driving": "auto_mode",
};

const getFeatureName = (feature) => {
  if (typeof feature === "string") {
    return feature;
  }

  return feature?.name || "";
};

const getFeatureIcon = (feature) => {
  if (typeof feature === "string") {
    return {
      iconType: "material",
      value: featureIcon[feature] || "check",
    };
  }

  if (feature?.icon) {
    return {
      iconType: "image",
      value: feature.icon,
    };
  }

  const featureName = feature?.name || "";
  return {
    iconType: "material",
    value: featureIcon[featureName] || "check",
  };
};

const renderReviewStars = (rating) => {
  const numericRating = Number(rating);
  const safeRating = Number.isFinite(numericRating) ? numericRating : 0;
  const rounded = Math.max(0, Math.min(5, Math.round(safeRating)));

  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={`review-star-${index}`}
      className="material-symbols-outlined"
      style={{
        fontSize: 16,
        color: index < rounded ? "#f59e0b" : "#d1d5db",
        fontVariationSettings:
          index < rounded
            ? '"FILL" 1, "wght" 700, "GRAD" 0, "opsz" 24'
            : '"FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24',
      }}
    >
      star
    </span>
  ));
};

const CarInfoSection = ({ car }) => {
  const [mapImageFailed, setMapImageFailed] = useState(false);
  const badges = Array.isArray(car.badges) ? car.badges : [];
  const specs = Array.isArray(car.specs) ? car.specs : [];
  const description = Array.isArray(car.description) ? car.description : [];
  const features = Array.isArray(car.features) ? car.features : [];
  const reviews = Array.isArray(car.reviews) ? car.reviews : [];
  const shouldShowStaticMap = Boolean(car.mapImage) && !mapImageFailed;
  const shouldShowEmbedMap = !shouldShowStaticMap && Boolean(car.mapEmbedUrl);

  useEffect(() => {
    setMapImageFailed(false);
  }, [car.mapImage]);

  return (
    <>
      <section className="pb-4 border-bottom mb-4">
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
          <div>
            <div className="d-flex gap-2 align-items-center mb-2">
              {badges.map((badge) => (
                <Badge
                  key={badge}
                  bg=""
                  className="badge-soft-primary text-uppercase"
                >
                  {badge}
                </Badge>
              ))}
              <small className="text-muted d-flex align-items-center gap-1">
                <span
                  className="material-symbols-outlined text-success"
                  style={{ fontSize: 18 }}
                >
                  star
                </span>
                {car.rating || "0.0"} ({car.trips || 0} trips)
              </small>
            </div>
            <h1 className="fw-bold display-6 mb-1">
              {car.model || "Chi tiết xe"}
            </h1>
            <div className="text-muted">{car.location || ""}</div>
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm">
              <span className="material-symbols-outlined">ios_share</span>
            </Button>
            <Button variant="outline-secondary" size="sm">
              <span className="material-symbols-outlined">favorite</span>
            </Button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-4 mt-3">
          {specs.map((spec) => (
            <div
              key={spec}
              className="d-flex align-items-center gap-1 text-muted"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                {specIcon[spec] || "check_circle"}
              </span>
              <span>{spec}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-4 border-bottom mb-4">
        <h3 className="h5 fw-bold mb-3">Description</h3>
        <div className="d-grid gap-2 text-muted">
          {description.map((item) => (
            <p key={item} className="mb-0">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="pb-4 border-bottom mb-4">
        <h3 className="h5 fw-bold mb-3">Features</h3>
        <Row xs={1} md={2} className="g-3">
          {features.map((feature) => {
            const featureName = getFeatureName(feature);
            const iconConfig = getFeatureIcon(feature);

            return (
              <Col key={featureName}>
                <div className="d-flex align-items-center gap-2">
                  {iconConfig.iconType === "image" ? (
                    <img
                      src={iconConfig.value}
                      alt={featureName}
                      width="18"
                      height="18"
                      className="object-fit-contain"
                    />
                  ) : (
                    <span
                      className="material-symbols-outlined text-success"
                      style={{ fontSize: 18 }}
                    >
                      {iconConfig.value}
                    </span>
                  )}
                  <span>{featureName}</span>
                </div>
              </Col>
            );
          })}
        </Row>
      </section>

      <section className="pb-4 border-bottom mb-4">
        <h3 className="h5 fw-bold mb-3">Location</h3>
        {shouldShowStaticMap ? (
          <img
            src={car.mapImage}
            alt={`Bản đồ vị trí ${car.location || "xe"}`}
            className="rounded-3 w-100 object-fit-cover"
            style={{ height: 260 }}
            onError={() => setMapImageFailed(true)}
          />
        ) : shouldShowEmbedMap ? (
          <iframe
            title="Bản đồ vị trí xe"
            src={car.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-3 w-100 border"
            style={{ height: 260 }}
          />
        ) : (
          <div
            className="rounded-3 d-flex align-items-center justify-content-center border bg-light"
            style={{ height: 260 }}
          >
            <span className="text-muted">
              {car.location || "Địa chỉ sẽ được hiển thị tại đây"}
            </span>
          </div>
        )}
        <small className="text-muted mt-2 d-block">
          Exact location provided after booking confirmation.
        </small>
        {car.mapLink ? (
          <a
            href={car.mapLink}
            target="_blank"
            rel="noreferrer"
            className="small text-success fw-semibold d-inline-flex align-items-center gap-1 mt-2"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16 }}
            >
              open_in_new
            </span>
            Xem trên Google Maps
          </a>
        ) : null}
      </section>

      <section id="reviews">
        <div className="d-flex align-items-center gap-2 mb-3">
          <h3 className="h5 fw-bold mb-0">Reviews</h3>
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
            {car.rating}
          </Badge>
        </div>

        <div className="d-grid gap-3">
          {reviews.map((review) => (
            <Card key={review.id || review.name} className="border-0 shadow-sm">
              <Card.Body className="d-flex gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  width="48"
                  height="48"
                  className="rounded-circle object-fit-cover"
                />
                <div>
                  <div className="d-flex gap-2 align-items-center mb-1">
                    <strong>{review.name}</strong>
                    <small className="text-muted">{review.date}</small>
                  </div>
                  <div className="d-flex align-items-center gap-1 mb-2">
                    {renderReviewStars(review.rating)}
                    <small className="text-muted ms-1">
                      {Number.isFinite(Number(review.rating))
                        ? Number(review.rating).toFixed(1)
                        : "0.0"}
                    </small>
                  </div>
                  <p className="text-muted mb-0">{review.comment}</p>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
};

export default CarInfoSection;
