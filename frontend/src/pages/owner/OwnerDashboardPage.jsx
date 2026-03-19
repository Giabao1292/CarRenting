import { Button, Col, Row } from "react-bootstrap";
import BookingRequestCard from "../../components/owner/dashboard/BookingRequestCard";
import EarningsTable from "../../components/owner/dashboard/EarningsTable";
import FleetItemCard from "../../components/owner/dashboard/FleetItemCard";
import OwnerStatCard from "../../components/owner/dashboard/OwnerStatCard";
import { ownerDashboardData } from "../../data/ownerDashboardData";

const OwnerDashboardPage = () => {
  return (
    <>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back! Here's what's happening with your fleet today.
          </p>
        </div>
        <Button variant="outline-secondary" className="fw-bold">
          <span className="material-symbols-outlined align-middle me-1">
            download
          </span>
          Export Report
        </Button>
      </div>

      <Row className="g-3 mb-4">
        {ownerDashboardData.stats.map((stat) => (
          <Col key={stat.label} sm={6} xl={3}>
            <OwnerStatCard stat={stat} />
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col xl={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Booking Requests</h5>
            <a href="#" className="text-success fw-bold small">
              View All
            </a>
          </div>
          <div className="d-grid gap-3">
            {ownerDashboardData.bookingRequests.map((request) => (
              <BookingRequestCard key={request.id} request={request} />
            ))}
          </div>
        </Col>

        <Col xl={4}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">My Fleet</h5>
            <Button variant="light" size="sm" className="rounded-circle p-1">
              <span className="material-symbols-outlined">more_horiz</span>
            </Button>
          </div>
          <div className="d-grid gap-3">
            {ownerDashboardData.fleet.map((car) => (
              <FleetItemCard key={car.id} car={car} />
            ))}
            <Button variant="light" className="fw-bold border border-dashed">
              <span className="material-symbols-outlined align-middle me-1">
                add
              </span>
              Add Another Car
            </Button>
          </div>
        </Col>
      </Row>

      <EarningsTable rows={ownerDashboardData.earnings} />
    </>
  );
};

export default OwnerDashboardPage;
