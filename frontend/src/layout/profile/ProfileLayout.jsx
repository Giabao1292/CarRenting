import { Badge, Card, Col, Container, Row } from "react-bootstrap";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileTopBar from "./components/ProfileTopBar";
import ProfileTripCard from "./components/ProfileTripCard";
import { profileData } from "./profileData";

const ProfileLayout = () => {
  const confirmedTrips = profileData.trips.filter(
    (trip) => trip.status.toLowerCase() === "confirmed",
  ).length;

  return (
    <section className="mt-5 bg-light-subtle">
      <Container className="py-5">
        <Row className="g-4">
          <Col lg={3}>
            <ProfileSidebar user={profileData.user} />
          </Col>

          <Col lg={9}>
            <ProfileTopBar />

            <Row className="g-3 mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body>
                    <div className="small text-muted mb-2">Total Trips</div>
                    <h4 className="fw-bold mb-0">{profileData.trips.length}</h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body>
                    <div className="small text-muted mb-2">Confirmed</div>
                    <h4 className="fw-bold mb-0 text-success">
                      {confirmedTrips}
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="small text-muted mb-2">Membership</div>
                      <h6 className="fw-bold mb-0">{profileData.user.tier}</h6>
                    </div>
                    <Badge className="badge-soft-primary border-0 px-3 py-2">
                      Active
                    </Badge>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-grid gap-3">
              {profileData.trips.map((trip) => (
                <ProfileTripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProfileLayout;
