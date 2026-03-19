import { Badge, Button, Card, Col, Row } from "react-bootstrap";

const ProfileTripCard = ({ trip }) => {
  const isConfirmed = trip.status.toLowerCase() === "confirmed";

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden card-hover">
      <Row className="g-0">
        <Col md={4} lg={3}>
          <div
            style={{
              height: "100%",
              minHeight: 190,
              backgroundImage: `url(${trip.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </Col>

        <Col md={8} lg={9}>
          <Card.Body className="p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <Badge
                bg={isConfirmed ? "success" : "warning"}
                text={isConfirmed ? undefined : "dark"}
                className="px-3 py-2"
              >
                {trip.status}
              </Badge>
              <div className="fw-bold fs-5">{trip.price}</div>
            </div>

            <div className="text-uppercase small fw-semibold text-success mb-2">
              {trip.category}
            </div>
            <h5 className="fw-bold mb-3">{trip.name}</h5>

            <div className="d-grid gap-2 mb-3 small">
              <div className="d-flex align-items-center gap-2 text-muted">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  calendar_today
                </span>
                {trip.dates}
              </div>
              <div className="d-flex align-items-center gap-2 text-muted">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  location_on
                </span>
                {trip.location}
              </div>
              {trip.access && (
                <div className="d-flex align-items-center gap-2 text-muted">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    key
                  </span>
                  {trip.access}
                </div>
              )}
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Button className="btn-primary-custom fw-bold px-4">
                View Trip
              </Button>
              <Button variant="outline-secondary" className="fw-semibold">
                Contact Host
              </Button>
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
};

export default ProfileTripCard;
