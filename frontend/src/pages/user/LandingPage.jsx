import { Container } from "react-bootstrap";
import FeaturedSection from "../../components/user/landing/FeaturedSection";
import HeroSection from "../../components/user/landing/HeroSection";
import OwnerCTA from "../../components/user/landing/OwnerCTA";

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
