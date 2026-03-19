import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { heroBg } from "../../../data/landingData";

const HeroSection = () => {
  return (
    <section className="position-relative rounded-4 overflow-hidden shadow-lg mb-5 mioto-hero-section">
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="position-absolute top-0 start-0 w-100 h-100 mioto-hero-overlay" />

      <div
        className="position-relative p-4 p-md-5 text-white d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: 560 }}
      >
        <h1 className="mioto-hero-title text-center fw-bold mb-3">
          YIOTO - Cùng Bạn Trên
          <br />
          Mọi Hành Trình
        </h1>
        <div className="mioto-hero-divider mb-3" />
        <p className="mioto-hero-subtitle text-center mb-4">
          Trải nghiệm sự khác biệt từ <span>hơn 10.000</span> xe gia đình đời
          mới khắp Việt Nam
        </p>

        <Card className="mioto-booking-panel border-0 shadow-lg">
          <div className="mioto-booking-tabs d-flex">
            <button className="mioto-booking-tab active" type="button">
              <span className="material-symbols-outlined">drive_eta</span>
              Xe tự lái
            </button>
            <button className="mioto-booking-tab" type="button">
              <span className="material-symbols-outlined">local_taxi</span>
              Xe có tài xế
            </button>
            <button className="mioto-booking-tab" type="button">
              <span className="material-symbols-outlined">calendar_month</span>
              Thuê xe dài hạn
            </button>
          </div>

          <Card.Body className="p-3 p-md-4 bg-white rounded-bottom-4">
            <Form>
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Label className="mioto-field-label">
                    <span className="material-symbols-outlined">
                      location_on
                    </span>
                    Địa điểm
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="TP. Hồ Chí Minh"
                    className="mioto-field-input"
                  />
                </Col>

                <Col md={6}>
                  <Form.Label className="mioto-field-label">
                    <span className="material-symbols-outlined">
                      calendar_today
                    </span>
                    Thời gian thuê
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="21:00, 20/03/2026 - 20:00, 21/03/2026"
                    className="mioto-field-input"
                  />
                </Col>

                <Col md={2} className="d-grid">
                  <Button className="btn-primary-custom mioto-search-btn">
                    Tìm Xe
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </section>
  );
};

export default HeroSection;
