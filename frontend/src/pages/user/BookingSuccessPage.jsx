import { Button, Card, Col, Container, Row } from "react-bootstrap";
import SuccessSummaryCard from "../../components/user/booking-success/SuccessSummaryCard";
import { bookingSuccessData } from "../../data/bookingSuccessData";

const BookingSuccessPage = () => {
  return (
    <section className="bg-light-subtle py-4">
      <Container className="py-5">
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Row className="g-0">
            <Col md={6} className="p-4 p-md-5 border-end">
              <div className="text-center">
                <div className="d-inline-flex p-3 rounded-circle bg-success-subtle mb-3">
                  <span
                    className="material-symbols-outlined text-success"
                    style={{ fontSize: 48 }}
                  >
                    check_circle
                  </span>
                </div>
                <h2 className="fw-bold mb-2">
                  {bookingSuccessData.messageTitle}
                </h2>
                <p className="text-muted mb-3">{bookingSuccessData.message}</p>
                <Card className="border-0 bg-light mb-4">
                  <Card.Body>
                    <small className="text-muted d-block">Booking ID</small>
                    <strong className="fs-5">
                      {bookingSuccessData.bookingId}
                    </strong>
                  </Card.Body>
                </Card>
                <div className="d-grid gap-2">
                  <Button className="btn-primary-custom fw-bold">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline-secondary" className="fw-bold">
                    View My Booking
                  </Button>
                </div>
              </div>
            </Col>
            <Col md={6} className="p-4 p-md-5 bg-light-subtle">
              <SuccessSummaryCard data={bookingSuccessData} />
            </Col>
          </Row>
        </Card>
      </Container>
    </section>
  );
};

export default BookingSuccessPage;
