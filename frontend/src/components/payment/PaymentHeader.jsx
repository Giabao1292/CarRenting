import { Button, Container, Nav, Navbar } from "react-bootstrap";

const PaymentHeader = ({ brand }) => {
  return (
    <Navbar expand="md" className="py-3 bg-white border-bottom" sticky="top">
      <Container fluid="xl">
        <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold">
          <span className="material-symbols-outlined text-success">
            local_taxi
          </span>
          {brand}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="payment-nav" />
        <Navbar.Collapse id="payment-nav">
          <Nav className="me-auto ms-md-4 gap-md-3">
            <Nav.Link href="#">Rent</Nav.Link>
            <Nav.Link href="#">Host</Nav.Link>
            <Nav.Link href="#">Help</Nav.Link>
          </Nav>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="link"
              className="text-dark text-decoration-none fw-semibold"
            >
              Log in
            </Button>
            <Button className="btn-primary-custom">Sign up</Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PaymentHeader;
