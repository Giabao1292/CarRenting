import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";

const OwnerCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="surface-light rounded-4 p-4 p-md-5 border shadow-sm">
      <Row className="align-items-center g-4">
        <Col md={6}>
          <h2 className="h3 fw-bold">Trở Thành Chủ Xe Cùng YIOTO</h2>
          <p className="text-muted-soft fs-5">
            Tăng thêm thu nhập thụ động từ chiếc xe nhàn rỗi của bạn. YIOTO hỗ
            trợ quy trình duyệt hồ sơ, bảo hiểm và kết nối khách thuê phù hợp.
          </p>

          <ul className="list-unstyled d-grid gap-2 mt-3 mb-4">
            <li className="d-flex align-items-center gap-2 fw-semibold text-body">
              <span className="material-symbols-outlined text-primary">
                check_circle
              </span>
              Tối ưu doanh thu theo ngày thuê thực tế
            </li>
            <li className="d-flex align-items-center gap-2 fw-semibold text-body">
              <span className="material-symbols-outlined text-primary">
                check_circle
              </span>
              Có hỗ trợ bảo hiểm và xử lý sự cố
            </li>
            <li className="d-flex align-items-center gap-2 fw-semibold text-body">
              <span className="material-symbols-outlined text-primary">
                check_circle
              </span>
              Hệ thống kiểm duyệt và xác minh người thuê
            </li>
          </ul>

          <Button
            className="fw-bold px-4 py-3"
            style={{ background: "#111813", color: "#fff" }}
            onClick={() => navigate(APP_ROUTES.OWNER_REGISTER)}
          >
            Đăng ký trở thành chủ xe
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
