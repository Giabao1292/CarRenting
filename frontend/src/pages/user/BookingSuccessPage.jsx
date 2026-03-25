import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";
import {
  clearCheckoutSessionContext,
  getBookingIdBySessionId,
  getBookingPaymentStatus,
} from "../../services/paymentService";

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [statusPayload, setStatusPayload] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const sessionId = urlParams.get("session_id") || "";
  const rawBookingIdFromQuery = Number(urlParams.get("bookingId") || 0);
  const bookingIdFromQuery =
    Number.isFinite(rawBookingIdFromQuery) && rawBookingIdFromQuery > 0
      ? rawBookingIdFromQuery
      : null;

  const bookingId = useMemo(() => {
    if (bookingIdFromQuery) {
      return bookingIdFromQuery;
    }

    return getBookingIdBySessionId(sessionId);
  }, [bookingIdFromQuery, sessionId]);

  useEffect(() => {
    let cancelled = false;

    const loadPaymentStatus = async () => {
      if (!bookingId) {
        setErrorMessage("Không tìm thấy bookingId sau khi thanh toán.");
        setIsLoading(false);
        return;
      }

      try {
        const payload = await getBookingPaymentStatus(bookingId);
        if (cancelled) {
          return;
        }

        setStatusPayload(payload);
        setErrorMessage("");
        if (sessionId) {
          clearCheckoutSessionContext(sessionId);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error?.message ||
            "Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPaymentStatus();

    return () => {
      cancelled = true;
    };
  }, [bookingId, sessionId]);

  const normalizedPaymentStatus = String(
    statusPayload?.paymentStatus || "",
  ).toLowerCase();
  const isPaid = normalizedPaymentStatus === "paid";
  const isCancelledFlow = location.pathname === APP_ROUTES.PAYMENT_CANCEL;

  const statusIcon = isCancelledFlow
    ? "cancel"
    : isPaid
      ? "check_circle"
      : "schedule";
  const statusColorClass = isCancelledFlow
    ? "text-danger"
    : isPaid
      ? "text-success"
      : "text-warning";

  if (isLoading) {
    return (
      <section className="bg-light-subtle py-4">
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status" />
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-light-subtle py-4">
      <Container className="py-5">
        {errorMessage ? (
          <Alert variant="warning" className="mb-4">
            {errorMessage}
          </Alert>
        ) : null}

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Body className="p-4 p-md-5 text-center">
            <div className="d-inline-flex p-3 rounded-circle bg-success-subtle mb-3">
              <span
                className={`material-symbols-outlined ${statusColorClass}`}
                style={{ fontSize: 48 }}
              >
                {statusIcon}
              </span>
            </div>

            {isPaid && !isCancelledFlow ? (
              <>
                <h2 className="fw-bold mb-2">Thanh toán thành công</h2>
                <p className="text-muted mb-4">
                  Chuyến đi của bạn đã được xác nhận.
                </p>
                <Button
                  className="btn-primary-custom fw-bold px-4"
                  onClick={() =>
                    navigate(
                      `${APP_ROUTES.PROFILE}?tab=trips${
                        bookingId ? `&bookingId=${bookingId}` : ""
                      }`,
                    )
                  }
                >
                  Đi đến chuyến của tôi
                </Button>
              </>
            ) : (
              <>
                <h2 className="fw-bold mb-2">
                  {isCancelledFlow
                    ? "Thanh toán đã bị hủy"
                    : "Đang xử lý thanh toán"}
                </h2>
                <p className="text-muted mb-4">
                  {isCancelledFlow
                    ? "Bạn có thể quay lại để thử thanh toán lại khi sẵn sàng."
                    : "Hệ thống đang đồng bộ trạng thái thanh toán. Vui lòng kiểm tra lại sau ít phút."}
                </p>
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <Button
                    className="btn-primary-custom fw-bold"
                    onClick={() => navigate(APP_ROUTES.RESULTS)}
                  >
                    Tiếp tục tìm xe
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="fw-bold"
                    onClick={() => navigate(APP_ROUTES.PROFILE)}
                  >
                    Đi tới hồ sơ
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </section>
  );
};

export default BookingSuccessPage;
