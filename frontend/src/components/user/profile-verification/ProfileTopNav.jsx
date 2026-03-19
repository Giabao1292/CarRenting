import { Button, Container, Nav, Navbar } from "react-bootstrap";

const ProfileTopNav = ({ brand, avatar }) => {
  return (
    <Navbar className="bg-white border-bottom py-3" sticky="top">
      <Container fluid="xl" className="justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-success">
            auto_awesome
          </span>
          <Navbar.Brand className="fw-bold mb-0">{brand}</Navbar.Brand>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Nav className="d-none d-md-flex gap-2 fw-semibold text-muted">
            <Nav.Link className="text-dark" href="#">
              Home
            </Nav.Link>
            <Nav.Link href="#">Rentals</Nav.Link>
            <Nav.Link href="#">About Us</Nav.Link>
            <Nav.Link href="#">Help Center</Nav.Link>
          </Nav>
          <Button variant="light" className="fw-bold d-none d-md-inline-block">
            Log Out
          </Button>
          <img
            src={avatar}
            alt="User"
            width={40}
            height={40}
            className="rounded-circle border object-fit-cover"
          />
        </div>
      </Container>
    </Navbar>
  );
};

export default ProfileTopNav;
