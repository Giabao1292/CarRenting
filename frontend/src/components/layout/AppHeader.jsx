import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";

const navItems = [
  { label: "Home", to: APP_ROUTES.HOME },
  { label: "Results", to: APP_ROUTES.RESULTS },
  { label: "Car Details", to: APP_ROUTES.CAR_DETAILS },
  { label: "Payment", to: APP_ROUTES.PAYMENT },
  { label: "Success", to: APP_ROUTES.BOOKING_SUCCESS },
  { label: "Renter", to: APP_ROUTES.RENTER_DASHBOARD },
  { label: "Owner", to: APP_ROUTES.OWNER_DASHBOARD },
  { label: "Admin", to: APP_ROUTES.ADMIN_DASHBOARD },
  { label: "Verify ID", to: APP_ROUTES.PROFILE_VERIFICATION },
];

const AppHeader = () => {
  return (
    <Navbar
      bg="white"
      expand="lg"
      className="border-bottom sticky-top shadow-sm app-main-header"
    >
      <Container fluid="xl">
        <Navbar.Brand className="fw-bold d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-success">
            local_taxi
          </span>
          AutoRent
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="app-main-nav" />
        <Navbar.Collapse id="app-main-nav">
          <Nav className="ms-auto d-flex align-items-lg-center gap-lg-2">
            {navItems.map((item) => (
              <Nav.Link
                as={NavLink}
                key={item.to}
                to={item.to}
                end={item.to === APP_ROUTES.HOME}
                className={({ isActive }) =>
                  `fw-semibold px-3 py-2 rounded-pill ${isActive ? "app-nav-active" : "text-muted"}`
                }
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
          <div className="d-flex align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0">
            <Button
              variant="light"
              className="rounded-pill px-3 fw-semibold border"
            >
              Sign in
            </Button>
            <Button className="btn-primary-custom rounded-pill px-3 fw-bold">
              Get started
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppHeader;
