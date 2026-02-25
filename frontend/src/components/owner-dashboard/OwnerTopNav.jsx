import { Badge, Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";

const OwnerTopNav = ({ brand, avatar }) => {
  return (
    <Navbar className="bg-white border-bottom py-3" sticky="top">
      <Container fluid="xl" className="justify-content-between">
        <Link
          to={APP_ROUTES.HOME}
          className="d-flex align-items-center gap-2 text-decoration-none text-body"
        >
          <span className="material-symbols-outlined text-success">
            local_taxi
          </span>
          <Navbar.Brand className="fw-bold mb-0">{brand}</Navbar.Brand>
        </Link>

        <Nav className="d-none d-md-flex gap-3 fw-semibold text-muted">
          <Nav.Link className="text-dark" href="#">
            Dashboard
          </Nav.Link>
          <Nav.Link href="#">My Fleet</Nav.Link>
          <Nav.Link href="#">Earnings</Nav.Link>
          <Nav.Link href="#">Settings</Nav.Link>
        </Nav>

        <div className="d-flex align-items-center gap-3">
          <Button className="btn-primary-custom fw-bold d-none d-sm-inline-flex align-items-center gap-1">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              add_circle
            </span>
            List a Car
          </Button>
          <img
            src={avatar}
            alt="Owner"
            width={40}
            height={40}
            className="rounded-circle border border-success object-fit-cover"
          />
          <Badge bg="light" text="dark" className="d-none d-lg-inline">
            Host Mode
          </Badge>
        </div>
      </Container>
    </Navbar>
  );
};

export default OwnerTopNav;
