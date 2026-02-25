import { Badge, Card, Col, Container, Row } from "react-bootstrap";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import DashboardTripCard from "../components/dashboard/DashboardTripCard";
import { dashboardData } from "../data/dashboardData";

const DashboardPage = () => {
  const confirmedTrips = dashboardData.trips.filter(
    (trip) => trip.status.toLowerCase() === "confirmed",
  ).length;

  return (
    <section className="mt-5 bg-light-subtle">
      <Container className="py-5">
        <Row className="g-4">
          <Col lg={3}>
            <DashboardSidebar user={dashboardData.user} />
          </Col>

          <Col lg={9}>
            <DashboardTopBar />

            <Row className="g-3 mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body>
                    <div className="small text-muted mb-2">Total Trips</div>
                    <h4 className="fw-bold mb-0">
                      {dashboardData.trips.length}
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body>
                    <div className="small text-muted mb-2">Confirmed</div>
                    <h4 className="fw-bold mb-0 text-success">
                      {confirmedTrips}
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="small text-muted mb-2">Membership</div>
                      <h6 className="fw-bold mb-0">
                        {dashboardData.user.tier}
                      </h6>
                    </div>
                    <Badge className="badge-soft-primary border-0 px-3 py-2">
                      Active
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-grid gap-3">
              {dashboardData.trips.map((trip) => (
                <DashboardTripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default DashboardPage;
