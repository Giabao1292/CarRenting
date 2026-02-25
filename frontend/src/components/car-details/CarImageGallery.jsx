import { Col, Row } from "react-bootstrap";

const CarImageGallery = ({ images = [] }) => {
  if (!images.length) return null;

  return (
    <div className="mb-4">
      <Row className="g-2">
        <Col md={6}>
          <div
            className="rounded-3 w-100"
            style={{
              height: 340,
              backgroundImage: `url(${images[0]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </Col>
        <Col md={6}>
          <Row className="g-2">
            {images.slice(1, 5).map((img) => (
              <Col xs={6} key={img}>
                <div
                  className="rounded-3 w-100"
                  style={{
                    height: 166,
                    backgroundImage: `url(${img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default CarImageGallery;
