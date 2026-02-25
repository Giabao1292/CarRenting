import { Component } from "react";
import { Button, Container } from "react-bootstrap";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled UI error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 text-center">
          <h1 className="h3 fw-bold mb-3">Something went wrong</h1>
          <p className="text-muted mb-4">
            An unexpected error occurred. Please reload the page.
          </p>
          <Button
            onClick={this.handleReload}
            className="btn-primary-custom fw-bold"
          >
            Reload
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
