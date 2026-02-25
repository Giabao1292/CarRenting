import { Badge, Button, Card, Col, Form } from "react-bootstrap";
import { heroBg } from "../../data/landingData";

const HeroSection = () => {
  return (
    <section className="position-relative rounded-4 overflow-hidden shadow-lg mb-5">
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="position-absolute top-0 start-0 w-100 h-100 bg-hero-overlay" />

      <div
        className="position-relative p-4 p-md-5 text-white"
        style={{ minHeight: 500 }}
      >
        <Badge
          bg=""
          className="badge-soft-primary text-uppercase fw-bold small mb-3 px-3 py-2"
        >
          The Future of Travel
        </Badge>

        <h1
          className="display-4 fw-black mb-3"
          style={{ fontWeight: 900, maxWidth: 760 }}
        >
          Find the perfect{" "}
          <span style={{ color: "var(--primary)" }}>autonomous</span> car for
          your next trip.
        </h1>

        <p className="lead text-light mb-4" style={{ maxWidth: 520 }}>
          Skip the counter and unlock self-driving cars directly from your
          phone. Available in major cities worldwide.
        </p>

        <Card
          className="p-3 p-md-4 shadow-lg hero-search surface-dark text-white border-0"
          style={{ maxWidth: 780 }}
        >
          <Form className="row g-2 align-items-center">
            <Col md={4}>
              <Form.Label className="text-muted-soft small mb-1">
                Location
              </Form.Label>
              <div className="position-relative">
                <span className="material-symbols-outlined position-absolute start-0 ps-2 top-50 translate-middle-y text-muted-soft">
                  search
                </span>
                <Form.Control
                  type="text"
                  placeholder="City, airport, or address"
                  className="ps-5 bg-transparent text-white border-secondary"
                />
              </div>
            </Col>

            <Col md={3}>
              <Form.Label className="text-muted-soft small mb-1">
                Pickup
              </Form.Label>
              <div className="position-relative">
                <span className="material-symbols-outlined position-absolute start-0 ps-2 top-50 translate-middle-y text-muted-soft">
                  calendar_today
                </span>
                <Form.Control
                  type="text"
                  placeholder="Pickup"
                  className="ps-5 bg-transparent text-white border-secondary"
                />
              </div>
            </Col>

            <Col md={3}>
              <Form.Label className="text-muted-soft small mb-1">
                Return
              </Form.Label>
              <div className="position-relative">
                <span className="material-symbols-outlined position-absolute start-0 ps-2 top-50 translate-middle-y text-muted-soft">
                  event
                </span>
                <Form.Control
                  type="text"
                  placeholder="Return"
                  className="ps-5 bg-transparent text-white border-secondary"
                />
              </div>
            </Col>

            <Col md={2} className="d-grid">
              <Button className="btn-primary-custom py-3">Search</Button>
            </Col>
          </Form>
        </Card>
      </div>
    </section>
  );
};

export default HeroSection;
