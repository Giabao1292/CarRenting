import { Col, Container, Row } from "react-bootstrap";
import BookingCard from "../../components/user/car-details/BookingCard";
import CarImageGallery from "../../components/user/car-details/CarImageGallery";
import CarInfoSection from "../../components/user/car-details/CarInfoSection";
import SimilarCarsSection from "../../components/user/car-details/SimilarCarsSection";
import { carDetails, similarCars } from "../../data/carDetailsData";

const CarDetailsPage = () => {
  return (
    <section className="bg-white py-4">
      <Container fluid="xl" className="py-4">
        <CarImageGallery images={carDetails.heroImages} />

        <Row className="g-4">
          <Col lg={8}>
            <CarInfoSection car={carDetails} />
          </Col>
          <Col lg={4} className="d-none d-lg-block">
            <BookingCard car={carDetails} />
          </Col>
        </Row>

        <SimilarCarsSection cars={similarCars} />
      </Container>
    </section>
  );
};

export default CarDetailsPage;
