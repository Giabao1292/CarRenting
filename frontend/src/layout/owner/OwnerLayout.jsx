import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import OwnerSidebar from "./components/OwnerSidebar";
import TopNav from "../user/components/TopNav";
import { useAuth } from "../../context/AuthContext";

const OwnerLayout = () => {
  const { authUser, defaultAvatar } = useAuth();
  const ownerUser = {
    avatar: authUser?.avatar || defaultAvatar,
    name: authUser?.name || authUser?.email || "Chủ xe",
    role: authUser?.role || "OWNER",
  };

  return (
    <section className="bg-light-subtle" style={{ minHeight: "100vh" }}>
      <TopNav />

      <Container fluid="xl" className="py-4 py-lg-5">
        <Row className="g-4">
          <Col lg={3} className="d-none d-lg-block">
            <OwnerSidebar user={ownerUser} />
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
