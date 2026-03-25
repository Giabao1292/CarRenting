import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import authService from "../../services/authService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFY_TOKEN_LENGTH = 6;

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
    fullName: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [verifyDigits, setVerifyDigits] = useState(
    Array(VERIFY_TOKEN_LENGTH).fill(""),
  );
  const [registerStep, setRegisterStep] = useState("form");
  const verifyInputRefs = useRef([]);

  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [verifyErrors, setVerifyErrors] = useState({});
  const [loginServerError, setLoginServerError] = useState("");
  const [registerServerError, setRegisterServerError] = useState("");
  const [registerServerSuccess, setRegisterServerSuccess] = useState("");
  const [verifyServerError, setVerifyServerError] = useState("");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [isVerifySubmitting, setIsVerifySubmitting] = useState(false);

  const isLoginMode = useMemo(() => mode === "login", [mode]);
  const verifyToken = useMemo(() => verifyDigits.join(""), [verifyDigits]);

  useEffect(() => {
    if (isLoginMode) {
      return;
    }

    setRegisterStep("form");
    setRegisterErrors({});
    setVerifyErrors({});
    setRegisterServerError("");
    setRegisterServerSuccess("");
    setVerifyServerError("");
    setVerifyDigits(Array(VERIFY_TOKEN_LENGTH).fill(""));
  }, [isLoginMode]);

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

    if (!registerValues.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ và tên.";
    }

    if (!registerValues.dateOfBirth) {
      nextErrors.dateOfBirth = "Vui lòng chọn ngày sinh.";
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

    setRegisterErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateVerify = () => {
    const nextErrors = {};

    if (!verifyToken.trim()) {
      nextErrors.token = "Vui lòng nhập mã xác thực.";
    } else if (verifyToken.trim().length !== VERIFY_TOKEN_LENGTH) {
      nextErrors.token = "Mã xác thực không hợp lệ.";
    }

    setVerifyErrors(nextErrors);
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

  const handleSubmitRegister = async (event) => {
    event.preventDefault();
    setRegisterServerError("");
    setRegisterServerSuccess("");

    if (!validateRegister()) {
      return;
    }

    try {
      setIsRegisterSubmitting(true);
      const result = await authService.register({
        email: registerValues.email.trim(),
        password: registerValues.password,
        fullName: registerValues.fullName.trim(),
        dateOfBirth: registerValues.dateOfBirth,
      });

      setRegisterServerSuccess(
        result.message ||
          "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.",
      );
      setVerifyDigits(Array(VERIFY_TOKEN_LENGTH).fill(""));
      setRegisterStep("verify");
    } catch (error) {
      const serverMessage =
        error?.message || "Đăng ký thất bại, vui lòng thử lại.";
      setRegisterServerError(serverMessage);
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginServerError("");

    try {
      setIsGoogleSubmitting(true);
      const loggedUser = await authService.loginWithGoogle();
      onLoginSuccess?.(loggedUser);
      onHide();
    } catch (error) {
      const serverMessage =
        error?.message || "Đăng nhập Google thất bại, vui lòng thử lại.";
      setLoginServerError(serverMessage);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmitVerify = async (event) => {
    event.preventDefault();
    setVerifyServerError("");

    if (!validateVerify()) {
      return;
    }

    try {
      setIsVerifySubmitting(true);
      const loggedUser = await authService.verifyRegistration({
        email: registerValues.email.trim(),
        token: verifyToken.trim().toUpperCase(),
      });

      onLoginSuccess?.({
        ...loggedUser,
        name: registerValues.fullName.trim() || loggedUser.name,
      });
      onHide();
    } catch (error) {
      const serverMessage =
        error?.message || "Xác thực thất bại, vui lòng thử lại.";
      setVerifyServerError(serverMessage);
    } finally {
      setIsVerifySubmitting(false);
    }
  };

  const handleVerifyDigitChange = (index, rawValue) => {
    const normalized = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (!normalized) {
      setVerifyDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    if (normalized.length > 1) {
      setVerifyDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < normalized.length; i += 1) {
          const targetIndex = index + i;
          if (targetIndex >= VERIFY_TOKEN_LENGTH) {
            break;
          }
          next[targetIndex] = normalized[i];
        }
        return next;
      });
      const focusIndex = Math.min(
        index + normalized.length,
        VERIFY_TOKEN_LENGTH - 1,
      );
      verifyInputRefs.current[focusIndex]?.focus();
      verifyInputRefs.current[focusIndex]?.select();
      return;
    }

    setVerifyDigits((prev) => {
      const next = [...prev];
      next[index] = normalized;
      return next;
    });
    if (index < VERIFY_TOKEN_LENGTH - 1) {
      verifyInputRefs.current[index + 1]?.focus();
      verifyInputRefs.current[index + 1]?.select();
    }
  };

  const handleVerifyDigitKeyDown = (index, event) => {
    if (event.key === "Backspace" && !verifyDigits[index] && index > 0) {
      verifyInputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      verifyInputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < VERIFY_TOKEN_LENGTH - 1) {
      event.preventDefault();
      verifyInputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyPaste = (event) => {
    event.preventDefault();
    const pastedValue = event.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, VERIFY_TOKEN_LENGTH);

    if (!pastedValue) {
      return;
    }

    const next = Array(VERIFY_TOKEN_LENGTH).fill("");
    pastedValue.split("").forEach((char, index) => {
      next[index] = char;
    });
    setVerifyDigits(next);

    const focusIndex = Math.min(pastedValue.length, VERIFY_TOKEN_LENGTH) - 1;
    verifyInputRefs.current[focusIndex]?.focus();
    verifyInputRefs.current[focusIndex]?.select();
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
                disabled={isLoginSubmitting || isGoogleSubmitting}
              >
                {isLoginSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <div className="auth-divider">
                <span>hoặc</span>
              </div>

              <Button
                type="button"
                variant="light"
                className="w-100 auth-google-btn"
                onClick={handleGoogleLogin}
                disabled={isLoginSubmitting || isGoogleSubmitting}
              >
                <span className="auth-google-badge" aria-hidden="true">
                  G
                </span>
                {isGoogleSubmitting
                  ? "Đang mở Google..."
                  : "Đăng nhập với Google"}
              </Button>
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
            <div className="auth-register-step-badge">
              {registerStep === "form"
                ? "Bước 1/2 - Tạo tài khoản"
                : "Bước 2/2 - Xác thực email"}
            </div>

            {registerStep === "form" ? (
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

                <Form.Group className="mb-2" controlId="register-full-name">
                  <Form.Label className="auth-label">Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    value={registerValues.fullName}
                    onChange={(event) =>
                      setRegisterValues((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      }))
                    }
                    isInvalid={Boolean(registerErrors.fullName)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {registerErrors.fullName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-2" controlId="register-date-of-birth">
                  <Form.Label className="auth-label">Ngày sinh</Form.Label>
                  <Form.Control
                    type="date"
                    value={registerValues.dateOfBirth}
                    onChange={(event) =>
                      setRegisterValues((prev) => ({
                        ...prev,
                        dateOfBirth: event.target.value,
                      }))
                    }
                    isInvalid={Boolean(registerErrors.dateOfBirth)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {registerErrors.dateOfBirth}
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
                  <Form.Label className="auth-label">
                    Nhập lại mật khẩu
                  </Form.Label>
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

                <Button
                  type="submit"
                  className="btn-primary-custom w-100 auth-submit-btn"
                  disabled={isRegisterSubmitting}
                >
                  {isRegisterSubmitting ? "Đang đăng ký..." : "Tiếp tục"}
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleSubmitVerify} noValidate>
                <p className="auth-verify-description">
                  Mã xác thực đã được gửi tới email của bạn. Vui lòng nhập mã để
                  kích hoạt tài khoản.
                </p>

                <Form.Group className="mb-2" controlId="verify-token">
                  <Form.Label className="auth-label">Mã xác thực</Form.Label>
                  <div
                    className="auth-verify-code-grid"
                    onPaste={handleVerifyPaste}
                  >
                    {verifyDigits.map((digit, index) => (
                      <Form.Control
                        key={`verify-digit-${index}`}
                        type="text"
                        inputMode="text"
                        maxLength={1}
                        value={digit}
                        ref={(element) => {
                          verifyInputRefs.current[index] = element;
                        }}
                        className="auth-verify-code-input"
                        onChange={(event) =>
                          handleVerifyDigitChange(index, event.target.value)
                        }
                        onKeyDown={(event) =>
                          handleVerifyDigitKeyDown(index, event)
                        }
                        isInvalid={Boolean(verifyErrors.token)}
                        aria-label={`Mã xác thực ký tự ${index + 1}`}
                      />
                    ))}
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {verifyErrors.token}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex gap-2 mt-3">
                  <Button
                    type="button"
                    variant="light"
                    className="w-50 auth-back-btn"
                    onClick={() => {
                      setVerifyErrors({});
                      setVerifyServerError("");
                      setVerifyDigits(Array(VERIFY_TOKEN_LENGTH).fill(""));
                      setRegisterStep("form");
                    }}
                    disabled={isVerifySubmitting}
                  >
                    Quay lại
                  </Button>

                  <Button
                    type="submit"
                    className="btn-primary-custom w-50 auth-submit-btn mt-0"
                    disabled={isVerifySubmitting}
                  >
                    {isVerifySubmitting ? "Đang xác thực..." : "Xác thực"}
                  </Button>
                </div>
              </Form>
            )}
          </>
        )}

        {isLoginMode && loginServerError && (
          <div className="text-danger small text-center mt-2">
            {loginServerError}
          </div>
        )}

        {!isLoginMode && registerServerSuccess && (
          <div className="text-success small text-center mt-2">
            {registerServerSuccess}
          </div>
        )}

        {!isLoginMode && registerServerError && (
          <div className="text-danger small text-center mt-2">
            {registerServerError}
          </div>
        )}

        {!isLoginMode && verifyServerError && (
          <div className="text-danger small text-center mt-2">
            {verifyServerError}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
