import { Col, Row } from "react-bootstrap";
import ResultCard from "../results/ResultCard";

const SimilarCarsSection = ({ cars = [] }) => {
  if (!cars.length) {
    return null;
  }

  return (
    <section className="mt-5 pt-2 similar-cars-section">
      <h2 className="h4 fw-bold mb-3">Xe tương tự</h2>
      <Row xs={1} md={2} lg={4} className="g-3">
        {cars.map((car) => (
          <Col key={car.id || car.title} className="d-flex">
            <ResultCard car={car} />
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default SimilarCarsSection;
