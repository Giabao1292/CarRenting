import { Card } from "react-bootstrap";

const VerificationTipsCard = ({ tips }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4 profile-tips-card">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-success">
            lightbulb
          </span>
          <h5 className="fw-bold mb-0">Verification Tips</h5>
        </div>

        <div className="d-grid gap-3">
          {tips.map((tip) => (
            <div
              key={tip}
              className="d-flex gap-2 align-items-start small text-muted"
            >
              <span className="badge rounded-pill text-bg-success-subtle text-success-emphasis">
                ✓
              </span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-top">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: 18 }}
            >
              lock
            </span>
            <strong className="small">Your Privacy Matters</strong>
          </div>
          <p className="small text-muted mb-0">
            Your data is encrypted and securely stored. We only use your ID for
            verification purposes compliant with local regulations.
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VerificationTipsCard;
