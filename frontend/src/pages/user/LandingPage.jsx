import { Container } from "react-bootstrap";
import FeaturedSection from "../../components/user/landing/FeaturedSection";
import HeroSection from "../../components/user/landing/HeroSection";
import LandingDiscoverySections from "../../components/user/landing/LandingDiscoverySections";

const LandingPage = () => {
  return (
    <>
      <Container className="py-4">
        <HeroSection />
        <FeaturedSection />
      </Container>

      <section className="landing-discovery-shell pb-4">
        <LandingDiscoverySections />
      </section>
    </>
  );
};

export default LandingPage;
