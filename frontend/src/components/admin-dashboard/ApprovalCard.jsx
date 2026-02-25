import { Badge, Button, Card, Col, Row } from "react-bootstrap";

const ApprovalCard = ({ item }) => {
  const flagged = item.status.toLowerCase() === "flagged";

  return (
    <Card className="border-0 shadow-sm rounded-4">
      <Card.Body className="p-4">
        <Row className="g-3">
          <Col sm={4}>
            <div
              className="rounded-3 h-100"
              style={{
                minHeight: 130,
                backgroundImage: `url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </Col>
          <Col sm={8}>
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div>
                <h5 className="fw-bold mb-1">{item.car}</h5>
                <div className="small text-muted">
                  Owned by {item.owner} • {item.listedAt}
                </div>
              </div>
              <Badge
                bg={flagged ? "danger" : "warning"}
                text={flagged ? undefined : "dark"}
              >
                {item.status}
              </Badge>
            </div>

            {item.note ? (
              <p className="small text-danger fw-semibold mb-3">{item.note}</p>
            ) : (
              <div className="d-flex flex-wrap gap-3 mb-3">
                {item.checklist?.map((check) => (
                  <span
                    key={check}
                    className="small text-muted d-inline-flex align-items-center gap-1"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      check_circle
                    </span>
                    {check}
                  </span>
                ))}
              </div>
            )}

            <div className="d-flex gap-2 flex-wrap">
              <Button
                className={`fw-bold ${item.danger ? "btn-danger" : "btn-primary-custom"}`}
                disabled={item.disabledPrimary}
              >
                {item.primaryAction}
              </Button>
              <Button variant="outline-secondary" className="fw-semibold">
                {item.secondaryAction}
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ApprovalCard;
