import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";

const NotFoundPage = () => {
  return (
    <Container className="py-5 text-center">
      <div className="mx-auto" style={{ maxWidth: 560 }}>
        <h1 className="fw-bold mb-2">404</h1>
        <h2 className="h4 mb-3">Page not found</h2>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          as={Link}
          to={APP_ROUTES.HOME}
          className="btn-primary-custom fw-bold"
        >
          Back to Home
        </Button>
      </div>
    </Container>
  );
};

export default NotFoundPage;
