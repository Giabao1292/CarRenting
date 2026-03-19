import { Button, Form, InputGroup } from "react-bootstrap";

const ProfileTopBar = () => {
  return (
    <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
      <div>
        <h2 className="fw-bold mb-1">My Profile</h2>
        <p className="text-muted mb-0">
          Manage trips, bookings, and account activity.
        </p>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2 dashboard-top-actions">
        <InputGroup>
          <InputGroup.Text className="bg-white border-end-0">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              search
            </span>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search trips..."
            className="border-start-0"
          />
        </InputGroup>
        <Button className="btn-primary-custom fw-bold px-4">New Booking</Button>
      </div>
    </div>
  );
};

export default ProfileTopBar;
