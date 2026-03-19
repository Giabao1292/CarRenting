import { Card } from "react-bootstrap";

const QuickActionsCard = ({ actions }) => {
  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Body>
        <h5 className="fw-bold mb-3">Quick Actions</h5>
        <div className="row g-2">
          {actions.map((action) => (
            <div className="col-6" key={action.label}>
              <button className="btn btn-light border w-100 py-3 d-flex flex-column align-items-center gap-1 fw-semibold">
                <span className="material-symbols-outlined text-muted">
                  {action.icon}
                </span>
                <small>{action.label}</small>
              </button>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuickActionsCard;
