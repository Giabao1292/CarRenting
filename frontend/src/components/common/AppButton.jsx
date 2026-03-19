import Button from "react-bootstrap/Button";

const AppButton = ({
  children,
  variant = "primary",
  className,
  type = "button",
  onClick,
  disabled = false,
}) => {
  return (
    <Button
      type={type}
      variant={variant}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export default AppButton;
