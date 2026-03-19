import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopNav from "./components/AdminTopNav";
import { adminDashboardData } from "../../data/adminDashboardData";

const AdminLayout = () => {
  return (
    <section className="bg-light-subtle" style={{ minHeight: "100vh" }}>
      <AdminTopNav
        avatar={adminDashboardData.admin.avatar}
      />

      <Container fluid="xl" className="py-4 py-lg-5">
        <Row className="g-4">
          <Col lg={3} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>

          <Col lg={9}>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AdminLayout;
