import { Button, Col, Container, Row } from "react-bootstrap";
import ResultCard from "../components/results/ResultCard";
import SidebarFilters from "../components/results/SidebarFilters";
import { resultCards } from "../data/resultsData";

const ResultsPage = () => {
  return (
    <>
      <Container className="py-5">
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 text-muted-soft fw-semibold small mb-4">
            <a href="#" className="text-muted-soft text-decoration-none">
              Home
            </a>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              chevron_right
            </span>
            <a href="#" className="text-muted-soft text-decoration-none">
              Rentals
            </a>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              chevron_right
            </span>
            <span className="text-body">San Francisco</span>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              <h1 className="display-6 fw-black mb-2 lh-sm">
                Available Cars in San Francisco
              </h1>
              <div className="text-muted-soft fw-semibold">
                125 vehicles found available for your dates • Oct 12 - 15
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="light"
                className="border fw-semibold d-flex align-items-center gap-1 px-3"
              >
                <span className="material-symbols-outlined">swap_vert</span>
                Sort by: Recommended
              </Button>
              <Button
                variant="light"
                className="border fw-semibold d-flex align-items-center gap-1 d-md-none px-3"
              >
                <span className="material-symbols-outlined">tune</span>
                Filters
              </Button>
            </div>
          </div>
        </div>

        <Row className="g-4">
          <Col md="auto">
            <SidebarFilters />
          </Col>

          <Col>
            <Row xs={1} md={2} lg={3} className="g-4">
              {resultCards.map((car) => (
                <Col key={car.title}>
                  <ResultCard car={car} />
                </Col>
              ))}
            </Row>

            <div className="d-flex justify-content-center mt-5">
              <div className="d-flex align-items-center gap-2">
                <Button variant="light" className="border" disabled>
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </Button>
                <Button className="btn-primary-custom">1</Button>
                <Button variant="light" className="border">
                  2
                </Button>
                <Button variant="light" className="border">
                  3
                </Button>
                <span className="text-muted-soft px-2">...</span>
                <Button variant="light" className="border">
                  8
                </Button>
                <Button variant="light" className="border">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ResultsPage;
