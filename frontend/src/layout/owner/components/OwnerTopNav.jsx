import { Badge, Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";

const OwnerTopNav = ({ avatar }) => {
  return (
    <Navbar className="bg-white border-bottom py-3" sticky="top">
      <Container fluid="xl" className="justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link
            to={APP_ROUTES.HOME}
            className="d-flex align-items-center gap-2 text-decoration-none text-body"
          >
            <span className="mioto-brand-mark" aria-hidden="true" />
            <Navbar.Brand className="mb-0 mioto-brand-text">YIOTO</Navbar.Brand>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Nav className="d-none d-lg-flex gap-2 text-muted mioto-nav-links">
            <Nav.Link className="text-dark" href="#">
              Dashboard
            </Nav.Link>
            <Nav.Link href="#">My Fleet</Nav.Link>
            <Nav.Link href="#">Earnings</Nav.Link>
            <Nav.Link href="#">Settings</Nav.Link>
          </Nav>
          <Button className="btn-primary-custom fw-bold d-none d-sm-inline-flex align-items-center gap-1">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              add_circle
            </span>
            List a Car
          </Button>
          <Button
            variant="light"
            className="rounded-circle p-2 position-relative"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              notifications
            </span>
            <span className="admin-dot" />
          </Button>
          <img
            src={avatar}
            alt="Owner"
            width={40}
            height={40}
            className="rounded-circle border border-success object-fit-cover"
          />
          <Badge bg="light" text="dark" className="d-none d-md-inline">
            Host Mode
          </Badge>
        </div>
      </Container>
    </Navbar>
  );
};

export default OwnerTopNav;
