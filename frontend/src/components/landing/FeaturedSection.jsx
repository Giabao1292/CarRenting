import { Button, Card, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";
import { featuredCars } from "../../data/landingData";

const FeaturedSection = () => {
  const navigate = useNavigate();

  const handleOpenCarDetails = () => {
    navigate(APP_ROUTES.CAR_DETAILS);
  };

  return (
    <section className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="h3 fw-bold mb-0">Featured Cars</h2>
        <a
          className="text-decoration-none fw-semibold"
          style={{ color: "var(--primary)" }}
          href="#"
        >
          View all cars{" "}
          <span className="material-symbols-outlined align-middle">
            arrow_forward
          </span>
        </a>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {featuredCars.map((car) => (
          <Col key={car.title}>
            <Card
              className="h-100 border-0 shadow-sm card-hover surface-light"
              role="button"
              onClick={handleOpenCarDetails}
              style={{ cursor: "pointer" }}
            >
              <div
                className="position-relative"
                style={{ aspectRatio: "4 / 3" }}
              >
                <div
                  className="w-100 h-100"
                  style={{
                    backgroundImage: `url(${car.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="position-absolute top-2 end-2 bg-white bg-opacity-75 rounded px-2 py-1 small fw-semibold shadow-sm">
                  <span className="material-symbols-outlined text-primary align-middle">
                    star
                  </span>{" "}
                  {car.rating}
                </div>
              </div>

              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Card.Title className="fw-bold mb-1">
                      {car.title}
                    </Card.Title>
                    <div className="text-muted-soft small">{car.location}</div>
                  </div>
                  <div className="text-end">
                    <div
                      className="fw-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      {car.price}
                    </div>
                    <div className="text-muted-soft small">/day</div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 rounded bg-light text-muted-soft small d-inline-flex align-items-center gap-1">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      electric_bolt
                    </span>
                    {car.badge}
                  </span>
                  <span className="px-2 py-1 rounded bg-light text-muted-soft small d-inline-flex align-items-center gap-1">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      auto_mode
                    </span>
                    {car.badge2}
                  </span>
                </div>

                <Button
                  variant="outline-success"
                  className="w-100 fw-bold py-2 border-2"
                  onClick={handleOpenCarDetails}
                  style={{
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                  }}
                >
                  Book Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default FeaturedSection;
