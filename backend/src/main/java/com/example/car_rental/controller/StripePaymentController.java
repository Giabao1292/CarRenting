package com.example.car_rental.controller;

import com.example.car_rental.dto.request.CreateCheckoutSessionRequest;
import com.example.car_rental.dto.response.CheckoutSessionResponse;
import com.example.car_rental.dto.response.PaymentStatusResponse;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.service.StripeCheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class StripePaymentController {

    private final StripeCheckoutService stripeCheckoutService;

    @PostMapping("/checkout/session")
    public ResponseData<CheckoutSessionResponse> createCheckoutSession(
            Authentication authentication,
            @Valid @RequestBody CreateCheckoutSessionRequest request) {
        CheckoutSessionResponse response = stripeCheckoutService.createCheckoutSession(authentication.getName(),
                request);
        return new ResponseData<>(200, "Create checkout session successfully", response);
    }

    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> stripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String stripeSignature) {
        stripeCheckoutService.handleStripeWebhook(payload, stripeSignature);
        return ResponseEntity.ok("ok");
    }

    @GetMapping("/booking/{bookingId}/status")
    public ResponseData<PaymentStatusResponse> getBookingPaymentStatus(
            Authentication authentication,
            @PathVariable Integer bookingId) {
        PaymentStatusResponse response = stripeCheckoutService.getBookingPaymentStatus(authentication.getName(),
                bookingId);
        return new ResponseData<>(200, "Get payment status successfully", response);
    }
}
