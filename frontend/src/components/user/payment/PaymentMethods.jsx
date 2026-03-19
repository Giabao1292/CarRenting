import { Card, Form } from "react-bootstrap";

const PaymentMethods = ({ pageTitle, secureText, methods }) => {
  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="display-6 fw-bold mb-2">{pageTitle}</h1>
        <div className="d-inline-flex align-items-center gap-2 text-muted bg-white border rounded-pill px-3 py-2">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            lock
          </span>
          <small>{secureText}</small>
        </div>
      </div>

      <div>
        <h3 className="h5 fw-bold mb-3">Payment Method</h3>
        <div className="d-grid gap-2">
          {methods.map((method) => (
            <Card
              key={method.id}
              className="border-0 shadow-sm rounded-4 payment-method-card"
            >
              <Card.Body className="d-flex align-items-center gap-3 p-3 p-lg-4">
                <Form.Check
                  type="radio"
                  name="payment_method"
                  defaultChecked={method.defaultChecked}
                  className="mb-0"
                />
                <div className="flex-grow-1">
                  <div className="fw-bold mb-1">{method.title}</div>
                  <small className="text-muted d-block">
                    {method.description}
                  </small>
                </div>
                <div className="bg-light rounded p-2 d-flex align-items-center justify-content-center">
                  <span className="material-symbols-outlined text-muted">
                    {method.icon}
                  </span>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-0 bg-light-subtle rounded-4">
        <Card.Body className="p-3 p-lg-4">
          <Form.Check
            type="checkbox"
            label={
              <small className="text-muted d-block lh-base">
                I agree to the <a href="#">Terms of Service</a> and acknowledge
                the <a href="#"> Privacy Policy</a>. I understand the rental
                deposit policy.
              </small>
            }
          />
          <small className="text-muted d-block mt-2">
            You can review and change payment method before confirming order.
          </small>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentMethods;
