import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import TopNav from "../user/components/TopNav";

const OwnerLayout = () => {
  return (
    <section className="bg-light-subtle" style={{ minHeight: "100vh" }}>
      <TopNav />

      <Container fluid="xl" className="py-4 py-lg-5">
        <Row className="g-4">
          <Col lg={12}>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default OwnerLayout;
