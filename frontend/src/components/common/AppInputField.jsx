import Form from "react-bootstrap/Form";

const AppInputField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  maxLength,
}) => {
  return (
    <>
      <Form.Label htmlFor={id} className="small fw-semibold">
        {label}
      </Form.Label>
      <Form.Control
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isInvalid={Boolean(error)}
        maxLength={maxLength}
      />
      {helperText && !error && (
        <Form.Text className="text-muted">{helperText}</Form.Text>
      )}
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </>
  );
};

export default AppInputField;
