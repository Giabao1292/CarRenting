import { Button, Container, Form, Nav, Navbar } from "react-bootstrap";

const CarDetailsHeader = ({ brand = "AutonoRent" }) => {
  return (
    <Navbar expand="lg" className="py-3 bg-white border-bottom" sticky="top">
      <Container fluid="xl">
        <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold">
          <span className="material-symbols-outlined text-success">
            directions_car
          </span>
          {brand}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="car-details-nav" />
        <Navbar.Collapse id="car-details-nav">
          <Nav className="me-auto ms-lg-4 gap-lg-3">
            <Nav.Link href="#">Browse Cars</Nav.Link>
            <Nav.Link href="#">How it works</Nav.Link>
            <Nav.Link href="#">List your car</Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2">
            <Form.Control
              placeholder="Search location"
              className="d-none d-lg-block"
              style={{ width: 220 }}
            />
            <Button variant="outline-secondary" size="sm">
              Log In
            </Button>
            <Button className="btn-primary-custom" size="sm">
              Sign Up
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CarDetailsHeader;
