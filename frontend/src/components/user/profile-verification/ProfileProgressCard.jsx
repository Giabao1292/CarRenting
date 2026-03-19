import { ProgressBar } from "react-bootstrap";

const ProfileProgressCard = ({ completion, stepText }) => {
  return (
    <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5">
      <div className="d-flex flex-column flex-md-row justify-content-between gap-4">
        <div>
          <h1 className="fw-bold mb-2">Verify Your Identity</h1>
          <p className="text-muted mb-0">
            Please upload your identification documents to verify your account
            and start renting.
          </p>
        </div>
        <div style={{ minWidth: 220 }}>
          <div className="d-flex justify-content-between small fw-bold mb-2">
            <span>Profile Completion</span>
            <span className="text-success">{completion}%</span>
          </div>
          <ProgressBar
            now={completion}
            variant="success"
            style={{ height: 8 }}
          />
          <div className="small text-muted text-end mt-2">{stepText}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileProgressCard;
