import { Button, Card } from "react-bootstrap";

const dotClassByColor = {
  success: "bg-success",
  primary: "bg-primary",
  warning: "bg-warning",
  secondary: "bg-secondary",
};

const ActivityLogCard = ({ logs }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4 h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Activity Log</h5>
          <Button
            variant="link"
            className="p-0 text-success fw-bold text-decoration-none"
          >
            View All
          </Button>
        </div>

        <div className="admin-activity-timeline">
          {logs.map((log) => (
            <div key={log.id} className="admin-activity-item">
              <span
                className={`admin-activity-dot ${dotClassByColor[log.color] || "bg-secondary"}`}
              />
              <div>
                <div className="fw-semibold small">{log.title}</div>
                <div className="text-muted small">{log.detail}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>
                  {log.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ActivityLogCard;
