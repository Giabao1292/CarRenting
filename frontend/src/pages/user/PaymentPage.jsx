import { useMemo, useState } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import BookingSummaryCard from "../../components/user/payment/BookingSummaryCard";
import PaymentMethods from "../../components/user/payment/PaymentMethods";
import { APP_ROUTES } from "../../app/routes";
import {
  createCheckoutSession,
  saveCheckoutSessionContext,
} from "../../services/paymentService";

const formatCurrencyVnd = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "0 VND";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateText = (date, time) => {
  if (!date || !time) {
    return "--";
  }

  const [year, month, day] = String(date).split("-");
  if (!year || !month || !day) {
    return `${date} • ${time}`;
  }

  return `${day}/${month}/${year} • ${time}`;
};

const paymentMethods = [
  {
    id: "stripe",
    title: "Stripe",
    description: "Thanh toán an toàn bằng thẻ quốc tế qua Stripe Checkout",
    icon: "credit_card",
  },
];

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentDraft = location.state?.paymentDraft || null;
  const [selectedMethod, setSelectedMethod] = useState("stripe");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const bookingSummary = useMemo(() => {
    if (!paymentDraft) {
      return null;
    }

    const breakdown = [
      {
        label: `Giá theo ngày (${paymentDraft.dayUnits || 0} ngày)`,
        value: formatCurrencyVnd(paymentDraft.dayOriginalSubtotal),
      },
    ];

    if (Number(paymentDraft.extraHourUnits) > 0) {
      breakdown.push({
        label: `Giá theo giờ (${paymentDraft.extraHourUnits} giờ)`,
        value: formatCurrencyVnd(paymentDraft.hourlySubtotal),
      });
    }

    if (Number(paymentDraft.discountAmount) > 0) {
      breakdown.push({
        label: paymentDraft.promotionCode
          ? `Voucher ${paymentDraft.promotionCode}`
          : "Giảm giá",
        value: `-${formatCurrencyVnd(paymentDraft.discountAmount)}`,
        isDiscount: true,
      });
    }

    breakdown.push({
      label: "Phí dịch vụ",
      value: formatCurrencyVnd(paymentDraft.serviceFee),
    });

    return {
      bookingId: paymentDraft.bookingId,
      carId: paymentDraft.carId,
      pickupDate: paymentDraft.pickupDate,
      pickupTime: paymentDraft.pickupTime,
      dropoffDate: paymentDraft.dropoffDate,
      dropoffTime: paymentDraft.dropoffTime,
      carName: paymentDraft.carName,
      className: paymentDraft.className,
      image: paymentDraft.image,
      pickup: formatDateText(paymentDraft.pickupDate, paymentDraft.pickupTime),
      dropoff: formatDateText(
        paymentDraft.dropoffDate,
        paymentDraft.dropoffTime,
      ),
      location: paymentDraft.location || "",
      breakdown,
      total: formatCurrencyVnd(paymentDraft.totalPrice),
    };
  }, [paymentDraft]);

  const checkoutPayload = useMemo(() => {
    if (!bookingSummary) {
      return null;
    }

    const vehicleId = Number(bookingSummary.carId || 0);
    const totalAmount = Number(paymentDraft?.totalPrice || 0);

    const pickupDateTime = new Date(
      `${bookingSummary.pickupDate}T${bookingSummary.pickupTime}:00`,
    );
    const dropoffDateTime = new Date(
      `${bookingSummary.dropoffDate}T${bookingSummary.dropoffTime}:00`,
    );

    if (
      !Number.isFinite(vehicleId) ||
      vehicleId <= 0 ||
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0 ||
      Number.isNaN(pickupDateTime.getTime()) ||
      Number.isNaN(dropoffDateTime.getTime())
    ) {
      return null;
    }

    return {
      vehicleId,
      pickupAt: pickupDateTime.toISOString(),
      dropoffAt: dropoffDateTime.toISOString(),
      totalAmount,
      currency: "VND",
    };
  }, [bookingSummary, paymentDraft?.totalPrice]);

  const handleConfirmCheckout = async () => {
    setErrorMessage("");

    if (!checkoutPayload) {
      setErrorMessage("Thiếu dữ liệu đặt xe để tạo phiên thanh toán.");
      return;
    }

    if (selectedMethod !== "stripe") {
      setErrorMessage("Vui lòng chọn phương thức Stripe để tiếp tục.");
      return;
    }

    try {
      setIsSubmitting(true);
      const checkout = await createCheckoutSession(checkoutPayload);
      if (!checkout?.checkoutUrl) {
        throw new Error("Không nhận được đường dẫn thanh toán từ server.");
      }

      saveCheckoutSessionContext({
        sessionId: checkout.sessionId,
        bookingId: checkout.bookingId,
      });

      window.location.href = checkout.checkoutUrl;
    } catch (error) {
      setErrorMessage(
        error?.message || "Không thể khởi tạo thanh toán. Vui lòng thử lại.",
      );
      setIsSubmitting(false);
    }
  };

  if (!bookingSummary) {
    return (
      <section className="bg-light-subtle py-4">
        <Container fluid="xl" className="py-4 py-lg-5">
          <Alert variant="warning" className="mb-3">
            Không có dữ liệu đặt xe. Vui lòng quay lại trang chi tiết xe và bấm
            Book Now.
          </Alert>
          <button
            type="button"
            className="btn btn-success"
            onClick={() => navigate(APP_ROUTES.RESULTS)}
          >
            Quay lại tìm xe
          </button>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-light-subtle py-4">
      <Container fluid="xl" className="py-4 py-lg-5">
        <Row className="g-4 g-lg-5 align-items-start">
          <Col lg={7}>
            <PaymentMethods
              pageTitle="Xác nhận và thanh toán"
              secureText="Thanh toán được bảo mật bởi Stripe"
              methods={paymentMethods}
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />
          </Col>
          <Col lg={5}>
            <div className="position-sticky" style={{ top: 90 }}>
              <BookingSummaryCard
                booking={bookingSummary}
                selectedMethod={selectedMethod}
                onConfirm={handleConfirmCheckout}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default PaymentPage;
