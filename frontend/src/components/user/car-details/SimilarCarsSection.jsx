import { Card, Col, Row } from "react-bootstrap";

const SimilarCarsSection = ({ cars = [] }) => {
  return (
    <section className="mt-5 pt-2">
      <h2 className="h4 fw-bold mb-3">Similar cars available</h2>
      <Row xs={1} md={2} lg={3} className="g-3">
        {cars.map((car) => (
          <Col key={car.name}>
            <Card className="h-100 border-0 shadow-sm card-hover">
              <div
                style={{
                  height: 180,
                  backgroundImage: `url(${car.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <Card.Title className="h6 mb-0">{car.name}</Card.Title>
                  <small className="d-flex align-items-center gap-1">
                    <span
                      className="material-symbols-outlined text-success"
                      style={{ fontSize: 16 }}
                    >
                      star
                    </span>
                    {car.rating}
                  </small>
                </div>
                <div className="text-muted small mb-2">{car.subtitle}</div>
                <strong>{car.price} / day</strong>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default SimilarCarsSection;
