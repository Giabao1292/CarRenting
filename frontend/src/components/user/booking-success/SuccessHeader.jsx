import { Button, Container, Nav, Navbar } from "react-bootstrap";

const SuccessHeader = ({ brand }) => {
  return (
    <Navbar expand="md" className="py-3 bg-white border-bottom" sticky="top">
      <Container fluid="xl">
        <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold">
          <span className="material-symbols-outlined text-success">
            local_taxi
          </span>
          {brand}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="success-nav" />
        <Navbar.Collapse id="success-nav">
          <Nav className="me-auto ms-md-4 gap-md-3">
            <Nav.Link href="#">Cars</Nav.Link>
            <Nav.Link href="#">Locations</Nav.Link>
            <Nav.Link href="#">How it works</Nav.Link>
            <Nav.Link href="#">Support</Nav.Link>
          </Nav>
          <div className="d-flex gap-2">
            <Button variant="light">Log In</Button>
            <Button className="btn-primary-custom">Sign Up</Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default SuccessHeader;
