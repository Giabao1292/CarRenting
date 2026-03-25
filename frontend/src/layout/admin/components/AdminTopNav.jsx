import {
  Button,
  Container,
  Form,
  InputGroup,
  Nav,
  Navbar,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";
import { useAuth } from "../../../context/AuthContext";

const AdminTopNav = ({ avatar }) => {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate(APP_ROUTES.HOME, { replace: true });
  };

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
          <div className="d-none d-md-block">
            <InputGroup className="admin-search-input">
              <InputGroup.Text className="bg-light border-end-0">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  search
                </span>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search..."
                className="border-start-0 bg-light"
              />
            </InputGroup>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Nav className="d-none d-lg-flex gap-2 text-muted mioto-nav-links">
            <Nav.Link className="text-dark" href="#">
              Dashboard
            </Nav.Link>
            <Nav.Link href="#">Rentals</Nav.Link>
            <Nav.Link href="#">Users</Nav.Link>
            <Nav.Link href="#">Settings</Nav.Link>
          </Nav>
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
            alt="Admin"
            width={40}
            height={40}
            className="rounded-circle border border-success object-fit-cover"
          />
          <Button
            className="btn-primary-custom fw-bold d-none d-md-inline-block"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default AdminTopNav;
