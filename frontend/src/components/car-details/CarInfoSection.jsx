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

const CarInfoSection = ({ car }) => {
  return (
    <>
      <section className="pb-4 border-bottom mb-4">
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
          <div>
            <div className="d-flex gap-2 align-items-center mb-2">
              {car.badges.map((badge) => (
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
                {car.rating} ({car.trips} trips)
              </small>
            </div>
            <h1 className="fw-bold display-6 mb-1">{car.model}</h1>
            <div className="text-muted">{car.location}</div>
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
          {car.specs.map((spec) => (
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
          {car.description.map((item) => (
            <p key={item} className="mb-0">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="pb-4 border-bottom mb-4">
        <h3 className="h5 fw-bold mb-3">Features</h3>
        <Row xs={1} md={2} className="g-3">
          {car.features.map((feature) => (
            <Col key={feature}>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="material-symbols-outlined text-success"
                  style={{ fontSize: 18 }}
                >
                  {featureIcon[feature] || "check"}
                </span>
                <span>{feature}</span>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      <section className="pb-4 border-bottom mb-4">
        <h3 className="h5 fw-bold mb-3">Location</h3>
        <div
          className="rounded-3"
          style={{
            height: 260,
            backgroundImage: `url(${car.mapImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <small className="text-muted mt-2 d-block">
          Exact location provided after booking confirmation.
        </small>
      </section>

      <section>
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
          {car.reviews.map((review) => (
            <Card key={review.name} className="border-0 shadow-sm">
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
