import { useMemo, useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import authService from "../../services/authService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthModal = ({
  show,
  mode,
  onHide,
  onChangeMode,
  topOffset = 92,
  onLoginSuccess,
}) => {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);

  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [registerValues, setRegisterValues] = useState({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    agreed: true,
  });

  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [loginServerError, setLoginServerError] = useState("");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  const isLoginMode = useMemo(() => mode === "login", [mode]);

  const validateLogin = () => {
    const nextErrors = {};

    if (!loginValues.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!emailRegex.test(loginValues.email.trim())) {
      nextErrors.email = "Email chưa đúng định dạng.";
    }

    if (!loginValues.password.trim()) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (loginValues.password.trim().length < 6) {
      nextErrors.password = "Mật khẩu cần tối thiểu 6 ký tự.";
    }

    setLoginErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateRegister = () => {
    const nextErrors = {};

    if (!registerValues.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!emailRegex.test(registerValues.email.trim())) {
      nextErrors.email = "Email chưa đúng định dạng.";
    }

    if (!registerValues.displayName.trim()) {
      nextErrors.displayName = "Vui lòng nhập tên hiển thị.";
    }

    if (!registerValues.password.trim()) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (registerValues.password.trim().length < 6) {
      nextErrors.password = "Mật khẩu cần tối thiểu 6 ký tự.";
    }

    if (!registerValues.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
    } else if (registerValues.confirmPassword !== registerValues.password) {
      nextErrors.confirmPassword = "Mật khẩu nhập lại chưa khớp.";
    }

    if (!registerValues.agreed) {
      nextErrors.agreed = "Bạn cần đồng ý điều khoản để tiếp tục.";
    }

    setRegisterErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitLogin = async (event) => {
    event.preventDefault();
    setLoginServerError("");

    if (!validateLogin()) {
      return;
    }

    try {
      setIsLoginSubmitting(true);
      const loggedUser = await authService.login({
        email: loginValues.email.trim(),
        password: loginValues.password,
      });

      onLoginSuccess?.(loggedUser);
      onHide();
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại, vui lòng thử lại.";
      setLoginServerError(serverMessage);
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleSubmitRegister = (event) => {
    event.preventDefault();
    validateRegister();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      className="auth-modal-shell"
      style={{ "--auth-modal-top": `${topOffset}px` }}
      dialogClassName="auth-modal-dialog"
      contentClassName="auth-modal-content"
    >
      <button type="button" className="auth-modal-close" onClick={onHide}>
        <span className="material-symbols-outlined">close</span>
      </button>

      <Modal.Body className="p-4 p-md-4">
        {isLoginMode ? (
          <>
            <h3 className="auth-modal-title">Đăng nhập</h3>

            <Form onSubmit={handleSubmitLogin} noValidate>
              <Form.Group className="mb-3" controlId="login-email">
                <Form.Label className="auth-label">Email</Form.Label>
                <Form.Control
                  type="text"
                  value={loginValues.email}
                  onChange={(event) =>
                    setLoginValues((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  isInvalid={Boolean(loginErrors.email)}
                />
                <Form.Control.Feedback type="invalid">
                  {loginErrors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="login-password">
                <Form.Label className="auth-label">Mật khẩu</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showLoginPassword ? "text" : "password"}
                    value={loginValues.password}
                    onChange={(event) =>
                      setLoginValues((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    isInvalid={Boolean(loginErrors.password)}
                  />
                  <Button
                    variant="light"
                    className="auth-eye-btn"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                  >
                    <span className="material-symbols-outlined">
                      {showLoginPassword ? "visibility" : "visibility_off"}
                    </span>
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {loginErrors.password}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <div className="text-end mb-3">
                <button type="button" className="auth-link-btn">
                  Quên mật khẩu?
                </button>
              </div>

              <Button
                type="submit"
                className="btn-primary-custom w-100 auth-submit-btn"
                disabled={isLoginSubmitting}
              >
                {isLoginSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              {loginServerError && (
                <div className="text-danger small text-center mt-2">
                  {loginServerError}
                </div>
              )}
            </Form>

            <div className="auth-switch-text">
              Bạn chưa là thành viên?{" "}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => onChangeMode("register")}
              >
                Đăng ký ngay
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="auth-modal-title">Đăng ký</h3>

            <Form onSubmit={handleSubmitRegister} noValidate>
              <Form.Group className="mb-2" controlId="register-email">
                <Form.Label className="auth-label">Email</Form.Label>
                <Form.Control
                  type="text"
                  value={registerValues.email}
                  onChange={(event) =>
                    setRegisterValues((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  isInvalid={Boolean(registerErrors.email)}
                />
                <Form.Control.Feedback type="invalid">
                  {registerErrors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="register-display-name">
                <Form.Label className="auth-label">Tên hiển thị</Form.Label>
                <Form.Control
                  type="text"
                  value={registerValues.displayName}
                  onChange={(event) =>
                    setRegisterValues((prev) => ({
                      ...prev,
                      displayName: event.target.value,
                    }))
                  }
                  isInvalid={Boolean(registerErrors.displayName)}
                />
                <Form.Control.Feedback type="invalid">
                  {registerErrors.displayName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="register-password">
                <Form.Label className="auth-label">Mật khẩu</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerValues.password}
                    onChange={(event) =>
                      setRegisterValues((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    isInvalid={Boolean(registerErrors.password)}
                  />
                  <Button
                    variant="light"
                    className="auth-eye-btn"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                  >
                    <span className="material-symbols-outlined">
                      {showRegisterPassword ? "visibility" : "visibility_off"}
                    </span>
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {registerErrors.password}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group
                className="mb-2"
                controlId="register-confirm-password"
              >
                <Form.Label className="auth-label">Mật khẩu</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    value={registerValues.confirmPassword}
                    onChange={(event) =>
                      setRegisterValues((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
                    isInvalid={Boolean(registerErrors.confirmPassword)}
                  />
                  <Button
                    variant="light"
                    className="auth-eye-btn"
                    onClick={() =>
                      setShowRegisterConfirmPassword((prev) => !prev)
                    }
                  >
                    <span className="material-symbols-outlined">
                      {showRegisterConfirmPassword
                        ? "visibility"
                        : "visibility_off"}
                    </span>
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {registerErrors.confirmPassword}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-2" controlId="register-referral-code">
                <Form.Label className="auth-label">
                  Mã giới thiệu (nếu có)
                </Form.Label>
                <Form.Control
                  type="text"
                  value={registerValues.referralCode}
                  onChange={(event) =>
                    setRegisterValues((prev) => ({
                      ...prev,
                      referralCode: event.target.value,
                    }))
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="register-agree">
                <Form.Check
                  type="checkbox"
                  checked={registerValues.agreed}
                  onChange={(event) =>
                    setRegisterValues((prev) => ({
                      ...prev,
                      agreed: event.target.checked,
                    }))
                  }
                  label={
                    <span className="small text-muted">
                      Tôi đã đọc và đồng ý với{" "}
                      <span className="text-success">
                        Chính sách & quy định
                      </span>{" "}
                      và{" "}
                      <span className="text-success">
                        Chính sách bảo vệ dữ liệu cá nhân
                      </span>{" "}
                      của Mioto.
                    </span>
                  }
                  isInvalid={Boolean(registerErrors.agreed)}
                />
                <Form.Control.Feedback type="invalid" className="d-block">
                  {registerErrors.agreed}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                className="btn-primary-custom w-100 auth-submit-btn"
              >
                Đăng ký
              </Button>
            </Form>
          </>
        )}

        <div className="auth-social-row">
          <button type="button" className="auth-social-btn">
            <span className="auth-social-facebook">f</span>
            Facebook
          </button>
          <button type="button" className="auth-social-btn">
            <span className="auth-social-google">G</span>
            Google
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
