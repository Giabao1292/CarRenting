package com.example.car_rental.service.impl;

import com.example.car_rental.dto.request.CreateCheckoutSessionRequest;
import com.example.car_rental.dto.response.CheckoutSessionResponse;
import com.example.car_rental.dto.response.PaymentStatusResponse;
import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.model.*;
import com.example.car_rental.repository.BookingRepository;
import com.example.car_rental.repository.PaymentRepository;
import com.example.car_rental.repository.VehicleRepository;
import com.example.car_rental.service.StripeCheckoutService;
import com.example.car_rental.service.UserService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class StripeCheckoutServiceImpl implements StripeCheckoutService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final VehicleRepository vehicleRepository;
    private final UserService userService;
    private final EntityManager entityManager;

    @Value("${stripe.webhook-secret}")
    private String stripeWebhookSecret;

    @Value("${stripe.success-url:http://localhost:5173/payment/success}")
    private String stripeSuccessUrl;

    @Value("${stripe.cancel-url:http://localhost:5173/payment/cancel}")
    private String stripeCancelUrl;

    @Override
    @Transactional
    public CheckoutSessionResponse createCheckoutSession(String userEmail, CreateCheckoutSessionRequest request) {
        if (!request.getDropoffAt().isAfter(request.getPickupAt())) {
            throw new IllegalArgumentException("dropoffAt must be after pickupAt");
        }

        User user = userService.findByEmail(userEmail);
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + request.getVehicleId()));

        Location createdCheckoutLocation = createCheckoutLocationIfPresent(request);
        Location pickupLocation = createdCheckoutLocation != null
                ? createdCheckoutLocation
                : resolveLocation(request.getPickupLocationId(), vehicle.getDefaultLocation());
        Location dropoffLocation = createdCheckoutLocation != null
                ? createdCheckoutLocation
                : resolveLocation(request.getDropoffLocationId(), vehicle.getDefaultLocation());

        if (pickupLocation == null || dropoffLocation == null) {
            throw new IllegalArgumentException("Cannot resolve pickup/dropoff location for booking");
        }

        Booking booking = new Booking();
        booking.setBookingCode(generateBookingCode());
        booking.setUser(user);
        booking.setStatus("pending");
        booking.setPickupLocation(pickupLocation);
        booking.setDropoffLocation(dropoffLocation);
        booking.setPickupAt(request.getPickupAt());
        booking.setDropoffAt(request.getDropoffAt());
        booking.setTotalAmount(request.getTotalAmount());
        booking.setCurrency(normalizeCurrency(request.getCurrency()));
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());
        booking = bookingRepository.save(booking);

        BookingItem bookingItem = new BookingItem();
        bookingItem.setBooking(booking);
        bookingItem.setVehicle(vehicle);
        bookingItem.setStartAt(request.getPickupAt());
        bookingItem.setEndAt(request.getDropoffAt());
        bookingItem.setSubtotal(request.getTotalAmount());
        entityManager.persist(bookingItem);

        long amountVnd = toStripeVndAmount(request.getTotalAmount());
        if (amountVnd <= 0) {
            throw new IllegalArgumentException("Invalid booking total amount");
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(stripeSuccessUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(stripeCancelUrl)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .putMetadata("bookingId", String.valueOf(booking.getId()))
                .putMetadata("userEmail", userEmail)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("vnd")
                                                .setUnitAmount(amountVnd)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Car booking #" + booking.getBookingCode())
                                                                .build())
                                                .build())
                                .build())
                .build();

        Session session;
        try {
            String idempotencyKey = "booking-" + booking.getId() + "-" + userEmail;
            RequestOptions requestOptions = RequestOptions.builder()
                    .setIdempotencyKey(idempotencyKey)
                    .build();
            session = Session.create(params, requestOptions);
        } catch (StripeException e) {
            throw new IllegalArgumentException("Cannot create Stripe checkout session: " + e.getMessage());
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setUser(user);
        payment.setAmount(request.getTotalAmount());
        payment.setCurrency(normalizeCurrency(request.getCurrency()));
        payment.setProvider("stripe");
        payment.setProviderTxnId(session.getId());
        payment.setStatus("pending");
        if (payment.getCreatedAt() == null) {
            payment.setCreatedAt(Instant.now());
        }
        payment.setUpdatedAt(Instant.now());

        Payment savedPayment = paymentRepository.save(payment);

        return CheckoutSessionResponse.builder()
                .bookingId(booking.getId())
                .paymentId(savedPayment.getId())
                .sessionId(session.getId())
                .checkoutUrl(session.getUrl())
                .build();
    }

    @Override
    @Transactional
    public void handleStripeWebhook(String payload, String stripeSignature) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, stripeSignature, stripeWebhookSecret);
        } catch (SignatureVerificationException e) {
            throw new IllegalArgumentException("Invalid Stripe signature");
        }

        String eventType = event.getType();
        if ("checkout.session.completed".equals(eventType)
                || "checkout.session.async_payment_succeeded".equals(eventType)) {
            updatePaymentFromSession(event, true);
            return;
        }

        if ("checkout.session.expired".equals(eventType)
                || "checkout.session.async_payment_failed".equals(eventType)) {
            updatePaymentFromSession(event, false);
        }
    }

    @Override
    @Transactional
    public PaymentStatusResponse getBookingPaymentStatus(String userEmail, Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (booking.getUser() == null || booking.getUser().getEmail() == null
                || !booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalArgumentException("You are not allowed to view this booking payment");
        }

        Optional<Payment> paymentOpt = paymentRepository.findTopByBooking_IdOrderByCreatedAtDesc(bookingId);
        if (paymentOpt.isPresent()) {
            Payment synchronizedPayment = syncPaymentStatusFromStripe(paymentOpt.get());
            paymentOpt = Optional.ofNullable(synchronizedPayment);
        }

        return PaymentStatusResponse.builder()
                .bookingId(bookingId)
                .paymentId(paymentOpt.map(Payment::getId).orElse(null))
                .bookingStatus(booking.getStatus())
                .paymentStatus(paymentOpt.map(Payment::getStatus).orElse("unpaid"))
                .provider(paymentOpt.map(Payment::getProvider).orElse(null))
                .providerTxnId(paymentOpt.map(Payment::getProviderTxnId).orElse(null))
                .build();
    }

    private void updatePaymentFromSession(Event event, boolean paid) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = deserializer.getObject().orElse(null);
        if (stripeObject == null) {
            try {
                stripeObject = deserializer.deserializeUnsafe();
            } catch (EventDataObjectDeserializationException ex) {
                return;
            }
        }
        if (!(stripeObject instanceof Session session)) {
            return;
        }

        String sessionId = session.getId();
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        Payment payment = paymentRepository.findByProviderTxnId(sessionId).orElse(null);
        if (payment == null) {
            String bookingIdRaw = safeMetadata(session.getMetadata(), "bookingId");
            if (bookingIdRaw == null) {
                return;
            }

            Integer bookingId;
            try {
                bookingId = Integer.valueOf(bookingIdRaw);
            } catch (NumberFormatException ex) {
                return;
            }
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                return;
            }

            payment = new Payment();
            payment.setBooking(booking);
            payment.setUser(booking.getUser());
            payment.setAmount(booking.getTotalAmount());
            payment.setCurrency("VND");
            payment.setProvider("stripe");
            payment.setProviderTxnId(sessionId);
            payment.setCreatedAt(Instant.now());
        }

        if (paid && "paid".equalsIgnoreCase(payment.getStatus())) {
            return;
        }

        payment.setStatus(paid ? "paid" : "failed");
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        if (booking == null) {
            return;
        }

        if (paid && "pending".equalsIgnoreCase(booking.getStatus())) {
            booking.setStatus("active");
            booking.setUpdatedAt(Instant.now());
            bookingRepository.save(booking);
            createBookedAvailabilitySlot(booking);
            return;
        }

        if (!paid && "pending".equalsIgnoreCase(booking.getStatus())) {
            booking.setStatus("cancelled");
            booking.setUpdatedAt(Instant.now());
            bookingRepository.save(booking);
        }
    }

    private Payment syncPaymentStatusFromStripe(Payment payment) {
        if (payment == null) {
            return null;
        }

        if (!"stripe".equalsIgnoreCase(payment.getProvider())) {
            return payment;
        }

        String sessionId = payment.getProviderTxnId();
        if (sessionId == null || sessionId.isBlank()) {
            return payment;
        }

        if ("paid".equalsIgnoreCase(payment.getStatus()) || "failed".equalsIgnoreCase(payment.getStatus())) {
            return payment;
        }

        try {
            Session session = Session.retrieve(sessionId);
            String stripePaymentStatus = session.getPaymentStatus();
            String stripeSessionStatus = session.getStatus();

            if ("paid".equalsIgnoreCase(stripePaymentStatus)) {
                payment.setStatus("paid");
                payment.setUpdatedAt(Instant.now());
                Payment savedPayment = paymentRepository.save(payment);

                Booking booking = savedPayment.getBooking();
                if (booking != null && "pending".equalsIgnoreCase(booking.getStatus())) {
                    booking.setStatus("active");
                    booking.setUpdatedAt(Instant.now());
                    bookingRepository.save(booking);
                    createBookedAvailabilitySlot(booking);
                }

                return savedPayment;
            }

            if ("expired".equalsIgnoreCase(stripeSessionStatus)) {
                payment.setStatus("failed");
                payment.setUpdatedAt(Instant.now());
                Payment savedPayment = paymentRepository.save(payment);

                Booking booking = savedPayment.getBooking();
                if (booking != null && "pending".equalsIgnoreCase(booking.getStatus())) {
                    booking.setStatus("cancelled");
                    booking.setUpdatedAt(Instant.now());
                    bookingRepository.save(booking);
                }

                return savedPayment;
            }
        } catch (StripeException ignored) {
            // Keep current local status when Stripe API is temporarily unavailable.
        }

        return payment;
    }

    private String safeMetadata(Map<String, String> metadata, String key) {
        if (metadata == null) {
            return null;
        }
        String value = metadata.get(key);
        return value == null || value.isBlank() ? null : value;
    }

    private Location resolveLocation(Integer locationId, Location fallbackLocation) {
        if (locationId == null) {
            return fallbackLocation;
        }

        return entityManager.find(Location.class, locationId);
    }

    private Location createCheckoutLocationIfPresent(CreateCheckoutSessionRequest request) {
        if (request == null) {
            return null;
        }

        String city = normalizeBlank(request.getLocationCity());
        String address = normalizeBlank(request.getLocationAddress());

        if (city == null && address == null) {
            return null;
        }

        Location location = new Location();
        location.setName(buildLocationName(city, address));
        location.setCity(city);
        location.setAddress(address);
        location.setCountry("VN");

        if (isValidCoordinate(request.getLocationLat(), -90, 90)) {
            location.setLat(request.getLocationLat());
        }

        if (isValidCoordinate(request.getLocationLng(), -180, 180)) {
            location.setLng(request.getLocationLng());
        }

        Instant now = Instant.now();
        location.setCreatedAt(now);
        location.setUpdatedAt(now);
        entityManager.persist(location);

        return location;
    }

    private String buildLocationName(String city, String address) {
        if (city != null && address != null) {
            return (city + " - " + address).substring(0, Math.min(200, city.length() + address.length() + 3));
        }

        String base = city != null ? city : address;
        if (base == null || base.isBlank()) {
            return "Pickup & Return";
        }

        return base.length() > 200 ? base.substring(0, 200) : base;
    }

    private String normalizeBlank(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private boolean isValidCoordinate(Double value, double min, double max) {
        return value != null && !value.isNaN() && !value.isInfinite() && value >= min && value <= max;
    }

    private String normalizeCurrency(String currency) {
        String value = currency == null || currency.isBlank() ? "VND" : currency;
        return value.trim().toUpperCase();
    }

    private String generateBookingCode() {
        Random random = new Random();
        String code;
        do {
            long epochPart = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC);
            int randomPart = 1000 + random.nextInt(9000);
            code = "BK" + epochPart + randomPart;
        } while (bookingRepository.existsByBookingCode(code));

        return code;
    }

    private void createBookedAvailabilitySlot(Booking booking) {
        if (booking == null || booking.getBookingItems() == null || booking.getBookingItems().isEmpty()) {
            return;
        }

        BookingItem bookingItem = booking.getBookingItems().stream().findFirst().orElse(null);
        if (bookingItem == null || bookingItem.getVehicle() == null) {
            return;
        }

        Instant startAtInstant = bookingItem.getStartAt() != null ? bookingItem.getStartAt() : booking.getPickupAt();
        Instant endAtInstant = bookingItem.getEndAt() != null ? bookingItem.getEndAt() : booking.getDropoffAt();

        if (startAtInstant == null || endAtInstant == null || !endAtInstant.isAfter(startAtInstant)) {
            return;
        }

        AvailabilitySlot slot = new AvailabilitySlot();
        slot.setVehicle(bookingItem.getVehicle());
        slot.setStartAt(LocalDateTime.ofInstant(startAtInstant, ZoneOffset.UTC));
        slot.setEndAt(LocalDateTime.ofInstant(endAtInstant, ZoneOffset.UTC));
        slot.setStatus("booked");
        slot.setCreatedAt(LocalDateTime.now(ZoneOffset.UTC));
        entityManager.persist(slot);
    }

    private long toStripeVndAmount(BigDecimal amount) {
        if (amount == null) {
            return 0L;
        }
        return amount.setScale(0, RoundingMode.HALF_UP).longValueExact();
    }
}
