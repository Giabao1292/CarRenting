import { useEffect, useRef, useState } from "react";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";
import AuthModal from "../../../components/auth/AuthModal";
import { useAuth } from "../../../context/AuthContext";

const resolveDashboardRouteByRole = (role) => {
  const normalizedRole = String(role || "").toUpperCase();

  if (normalizedRole.includes("ADMIN")) {
    return APP_ROUTES.ADMIN_DASHBOARD;
  }

  if (normalizedRole.includes("OWNER")) {
    return APP_ROUTES.OWNER_DASHBOARD;
  }

  return null;
};

const TopNav = () => {
  const { authUser, isLoggedIn, loginUser, logoutUser, defaultAvatar } =
    useAuth();
  const navigate = useNavigate();
  const normalizedRole = String(authUser?.role || "").toUpperCase();
  const isOwner = normalizedRole.includes("OWNER");
  const ownerEntryLabel = isOwner ? "Quản Lý Xe" : "Trở thành chủ xe";
  const ownerEntryRoute = isOwner
    ? APP_ROUTES.OWNER_DASHBOARD
    : APP_ROUTES.OWNER_REGISTER;
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authModalTopOffset, setAuthModalTopOffset] = useState(90);
  const navRef = useRef(null);

  const openModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (loggedUser) => {
    loginUser(loggedUser);

    const dashboardRoute = resolveDashboardRouteByRole(loggedUser?.role);
    if (dashboardRoute) {
      navigate(dashboardRoute, { replace: true });
    }
  };

  const handleNavigateAccountSettings = () => {
    navigate(`${APP_ROUTES.PROFILE}?section=settings`);
  };

  const handleNavigateChangePassword = () => {
    navigate(`${APP_ROUTES.PROFILE}?section=change-password`);
  };

  const handleLogout = () => {
    logoutUser();
    navigate(APP_ROUTES.HOME);
  };

  useEffect(() => {
    const updateModalOffset = () => {
      if (!navRef.current) return;
      const nextOffset = navRef.current.getBoundingClientRect().height;
      setAuthModalTopOffset(Math.round(nextOffset));
    };

    updateModalOffset();
    window.addEventListener("resize", updateModalOffset);

    return () => {
      window.removeEventListener("resize", updateModalOffset);
    };
  }, []);

  return (
    <>
      <Navbar
        ref={navRef}
        className="bg-white border-bottom p-3 mioto-topnav"
        sticky="top"
      >
        <Container fluid="xl" className="justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <Link
              to={APP_ROUTES.HOME}
              className="d-flex align-items-center gap-2 text-decoration-none text-body"
            >
              <span className="mioto-brand-mark" aria-hidden="true" />
              <Navbar.Brand className="mb-0 mioto-brand-text">
                YIOTO
              </Navbar.Brand>
            </Link>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Nav className="d-none d-lg-flex gap-3 mioto-nav-links border-end pe-3">
              <Nav.Link as={Link} to={APP_ROUTES.HOME} className="text-dark">
                Về YIOTO
              </Nav.Link>
              <Nav.Link as={Link} to={ownerEntryRoute} className="text-dark">
                {ownerEntryLabel}
              </Nav.Link>
              <Nav.Link as={Link} to={APP_ROUTES.PROFILE} className="text-dark">
                Chuyến của tôi
              </Nav.Link>
            </Nav>

            {!isLoggedIn ? (
              <>
                <Button
                  variant="success"
                  className="px-3"
                  onClick={() => openModal("login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="light"
                  className="border-black px-4"
                  onClick={() => openModal("register")}
                >
                  Đăng ký
                </Button>
              </>
            ) : (
              <>
                <Button variant="link" className="mioto-icon-btn p-0">
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                </Button>
                <Button variant="link" className="mioto-icon-btn p-0">
                  <span className="material-symbols-outlined">chat</span>
                </Button>

                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center gap-2 text-dark mioto-user-label small">
                      <img
                        src={authUser?.avatar || defaultAvatar}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-circle object-fit-cover border"
                        onError={(event) => {
                          event.currentTarget.src = defaultAvatar;
                        }}
                      />
                      {authUser?.name || authUser?.email || "Người dùng"}
                    </span>
                  }
                  align="end"
                  id="profile-dropdown"
                  className="mioto-user-dropdown"
                  menuVariant="light"
                >
                  <div className="mioto-dropdown-header px-3 py-2 border-bottom">
                    <div className="fw-semibold text-dark">
                      {authUser?.name || "Tài khoản của tôi"}
                    </div>
                    <div className="small text-muted">
                      {authUser?.email || "Người dùng"}
                    </div>
                  </div>
                  <NavDropdown.Item
                    onClick={handleNavigateAccountSettings}
                    className="mioto-dropdown-item d-flex align-items-center gap-2"
                  >
                    <span className="material-symbols-outlined">settings</span>
                    Cài đặt tài khoản
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    onClick={handleNavigateChangePassword}
                    className="mioto-dropdown-item d-flex align-items-center gap-2"
                  >
                    <span className="material-symbols-outlined">lock</span>
                    Đổi mật khẩu
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    onClick={handleLogout}
                    className="mioto-dropdown-item mioto-dropdown-logout d-flex align-items-center gap-2"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </div>
        </Container>
      </Navbar>

      <AuthModal
        show={isAuthModalOpen}
        mode={authMode}
        onHide={() => setIsAuthModalOpen(false)}
        onChangeMode={setAuthMode}
        topOffset={authModalTopOffset}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default TopNav;
