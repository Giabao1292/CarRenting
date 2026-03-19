import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import OwnerSidebar from "./components/OwnerSidebar";
import OwnerTopNav from "./components/OwnerTopNav";
import { ownerDashboardData } from "../../data/ownerDashboardData";

const OwnerLayout = () => {
  return (
    <section className="bg-light-subtle" style={{ minHeight: "100vh" }}>
      <OwnerTopNav avatar={ownerDashboardData.user.avatar} />

      <Container fluid="xl" className="py-4 py-lg-5">
        <Row className="g-4">
          <Col lg={3} className="d-none d-lg-block">
            <OwnerSidebar user={ownerDashboardData.user} />
          </Col>

          <Col lg={9}>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default OwnerLayout;
