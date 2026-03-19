import { Button, Col, Row } from "react-bootstrap";
import ActivityLogCard from "../../components/admin/dashboard/ActivityLogCard";
import AdminStatCard from "../../components/admin/dashboard/AdminStatCard";
import ApprovalCard from "../../components/admin/dashboard/ApprovalCard";
import QuickActionsCard from "../../components/admin/dashboard/QuickActionsCard";
import { adminDashboardData } from "../../data/adminDashboardData";

const AdminDashboardPage = () => {
  return (
    <>
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Platform Overview</h2>
          <p className="text-muted mb-0">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="fw-semibold">
            <span className="material-symbols-outlined align-middle me-1">
              calendar_today
            </span>
            Last 30 Days
          </Button>
          <Button className="btn-primary-custom fw-bold">
            <span className="material-symbols-outlined align-middle me-1">
              add
            </span>
            New Report
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {adminDashboardData.stats.map((stat) => (
          <Col key={stat.label} sm={6} xl={3}>
            <AdminStatCard stat={stat} />
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col xl={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Pending Car Approvals</h5>
            <a href="#" className="text-success fw-bold small">
              View All
            </a>
          </div>

          <div className="d-grid gap-3">
            {adminDashboardData.approvals.map((item) => (
              <ApprovalCard key={item.id} item={item} />
            ))}
          </div>
        </Col>

        <Col xl={4}>
          <div className="d-grid gap-3">
            <QuickActionsCard actions={adminDashboardData.quickActions} />
            <ActivityLogCard logs={adminDashboardData.activityLog} />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboardPage;
