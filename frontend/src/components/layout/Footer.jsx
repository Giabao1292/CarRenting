import { Button, Col, Container, Row } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="surface-light border-top mt-5 py-5">
      <Container>
        <Row className="gy-4">
          <Col md={3}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(19,236,91,0.15)",
                  borderRadius: 10,
                }}
              >
                <span className="material-symbols-outlined text-primary">
                  directions_car
                </span>
              </div>
              <span className="fw-bold fs-5">AutoDrive</span>
            </div>
            <p className="text-muted-soft small mb-0">
              Experience the future of car rentals. Self-driving options,
              electric fleet, and seamless booking.
            </p>
          </Col>
          <Col md={3}>
            <h6 className="fw-bold mb-3">Company</h6>
            <div className="d-grid gap-2 text-muted-soft small">
              <a href="#" className="text-decoration-none text-muted-soft">
                About Us
              </a>
              <a href="#" className="text-decoration-none text-muted-soft">
                Careers
              </a>
              <a href="#" className="text-decoration-none text-muted-soft">
                Blog
              </a>
              <a href="#" className="text-decoration-none text-muted-soft">
                Press
              </a>
            </div>
          </Col>
          <Col md={3}>
            <h6 className="fw-bold mb-3">Support</h6>
            <div className="d-grid gap-2 text-muted-soft small">
              <a href="#" className="text-decoration-none text-muted-soft">
                Help Center
              </a>
              <a href="#" className="text-decoration-none text-muted-soft">
                Terms of Service
              </a>
              <a href="#" className="text-decoration-none text-muted-soft">
                Privacy Policy
              </a>
              <a href="#" className="text-decoration-none text-muted-soft">
                Trust & Safety
              </a>
            </div>
          </Col>
          <Col md={3}>
            <h6 className="fw-bold mb-3">Get the App</h6>
            <div className="d-grid gap-2">
              <Button
                variant="dark"
                className="d-flex align-items-center gap-2 px-3 py-2"
              >
                <span className="material-symbols-outlined">ios</span>
                <div className="d-flex flex-column lh-1 align-items-start">
                  <small className="text-white-50">Download on the</small>
                  <span className="fw-bold">App Store</span>
                </div>
              </Button>
              <Button
                variant="dark"
                className="d-flex align-items-center gap-2 px-3 py-2"
              >
                <span className="material-symbols-outlined">android</span>
                <div className="d-flex flex-column lh-1 align-items-start">
                  <small className="text-white-50">GET IT ON</small>
                  <span className="fw-bold">Google Play</span>
                </div>
              </Button>
            </div>
          </Col>
        </Row>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top text-muted-soft small gap-3">
          <span>© 2023 AutoDrive Inc. All rights reserved.</span>
          <div className="d-flex gap-3">
            <a href="#" className="text-muted-soft">
              <span className="material-symbols-outlined">
                social_leaderboard
              </span>
            </a>
            <a href="#" className="text-muted-soft">
              <span className="material-symbols-outlined">wb_twilight</span>
            </a>
            <a href="#" className="text-muted-soft">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
