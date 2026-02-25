import { Button, Col, Row } from "react-bootstrap";

const OwnerCTA = () => {
  return (
    <section className="surface-light rounded-4 p-4 p-md-5 border shadow-sm">
      <Row className="align-items-center g-4">
        <Col md={6}>
          <h2 className="h3 fw-bold">Become a Car Owner</h2>
          <p className="text-muted-soft fs-5">
            Earn passive income by sharing your self-driving car when you're not
            using it. We handle the insurance and logistics.
          </p>

          <ul className="list-unstyled d-grid gap-2 mt-3 mb-4">
            <li className="d-flex align-items-center gap-2 fw-semibold text-body">
              <span className="material-symbols-outlined text-primary">
                check_circle
              </span>
              Earn up to $1,500/month
            </li>
            <li className="d-flex align-items-center gap-2 fw-semibold text-body">
              <span className="material-symbols-outlined text-primary">
                check_circle
              </span>
              $1M liability insurance included
            </li>
            <li className="d-flex align-items-center gap-2 fw-semibold text-body">
              <span className="material-symbols-outlined text-primary">
                check_circle
              </span>
              Automatic vetting of renters
            </li>
          </ul>

          <Button
            className="fw-bold px-4 py-3"
            style={{ background: "#111813", color: "#fff" }}
          >
            List Your Car
          </Button>
        </Col>

        <Col md={6}>
          <div
            className="rounded-4 shadow-sm"
            style={{
              aspectRatio: "16 / 9",
              backgroundImage:
                "url(https://lh3.googleusercontent.com/aida-public/AB6AXuBloib2xr-x95By3Zp_D4-00qOtPD5abxUmlvyEtIG4u05ZX2il9yJODpF_SjP2ZbG7riXl1y5DCMRo5sAB-AciPZz-B8xTEM_dV6-Ao2jCaTSgfFM_zDgJEc2s3RwQiHeuvzVdpWj5pc8o2Hu1Qx7dreCgNsCtBI6EodS_LUg121z0c7tCc2th9hdDGDKEIYmkvVoZ6gKVOpjZf4BMtuUFYjOwQ6NX0ZqqX_HL1E_DqKnV7zjOVGnO4QBmIThMVn06s3-tPe30n2E)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </Col>
      </Row>
    </section>
  );
};

export default OwnerCTA;
