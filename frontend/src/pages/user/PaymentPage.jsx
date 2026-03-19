import { Col, Container, Row } from "react-bootstrap";
import BookingSummaryCard from "../../components/user/payment/BookingSummaryCard";
import PaymentMethods from "../../components/user/payment/PaymentMethods";
import { paymentData } from "../../data/paymentData";

const PaymentPage = () => {
  return (
    <section className="bg-light-subtle py-4">
      <Container fluid="xl" className="py-4 py-lg-5">
        <Row className="g-4 g-lg-5 align-items-start">
          <Col lg={7}>
            <PaymentMethods
              pageTitle={paymentData.pageTitle}
              secureText={paymentData.secureText}
              methods={paymentData.methods}
            />
          </Col>
          <Col lg={5}>
            <div className="position-sticky" style={{ top: 90 }}>
              <BookingSummaryCard booking={paymentData.booking} />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default PaymentPage;
