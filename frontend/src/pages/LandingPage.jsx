import { Container } from "react-bootstrap";
import FeaturedSection from "../components/landing/FeaturedSection";
import HeroSection from "../components/landing/HeroSection";
import OwnerCTA from "../components/landing/OwnerCTA";

const LandingPage = () => {
  return (
    <Container className="py-4">
      <HeroSection />
      <FeaturedSection />
      <OwnerCTA />
    </Container>
  );
};

export default LandingPage;
