import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";

const TopNav = () => {
  const isLoggedIn = false;

  return (
    <Navbar expand="lg" className="py-3 bg-white border-bottom" sticky="top">
      <Container>
        <Link
          to={APP_ROUTES.HOME}
          className="d-flex align-items-center gap-2 text-decoration-none text-body"
        >
          <div
            className="text-primary d-flex align-items-center justify-content-center"
            style={{
              width: 36,
              height: 36,
              background: "rgba(19,236,91,0.15)",
              borderRadius: 12,
            }}
          >
            <span className="material-symbols-outlined">directions_car</span>
          </div>
          <span className="fw-black fs-5">AutoRent</span>
        </Link>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-center gap-3">
            <Nav.Link
              as={Link}
              to={APP_ROUTES.OWNER_DASHBOARD}
              className="fw-semibold"
            >
              Trở thành chủ xe
            </Nav.Link>
            <Nav.Link
              as={Link}
              to={APP_ROUTES.RENTER_DASHBOARD}
              className="fw-semibold"
            >
              Chuyến đi của tôi
            </Nav.Link>

            {!isLoggedIn ? (
              <>
                <Button
                  variant="light"
                  className="fw-bold px-3 d-none d-sm-inline"
                >
                  Đăng nhập
                </Button>
                <Button className="btn-primary-custom px-3">Đăng ký</Button>
              </>
            ) : (
              <NavDropdown
                title={
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUH5FECen9HBkeywYTdApXoqJduBgRCpdOKWdAXLgutFlXlxWAP1Oyd7a4RyO-ZkkRN0o4Bc4k3WPUVkKVzG3iNNDjOg7r_vCKPWSpHjLbWBv0oyv4iTeK2UbDh5nE2RuvXhWOxmI73xmUgAbk6FKtlYsirHQhIyaBer1luP34d7-0OrGFyGCYFwm4y3e33k1qnJoCZfXy1MKqbMNulM2Wz4Do4kziw1KkdluzkLTtyOeT-4A2tc4jJ0DKCYMn7YRU0AxyuKnxfTs"
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-circle object-fit-cover"
                  />
                }
                align="end"
                id="profile-dropdown"
              >
                <NavDropdown.Item>Hồ sơ</NavDropdown.Item>
                <NavDropdown.Item>Cài đặt tài khoản</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item>Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNav;
