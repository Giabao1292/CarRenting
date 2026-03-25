package com.example.car_rental.service;

import com.example.car_rental.dto.request.CreateCheckoutSessionRequest;
import com.example.car_rental.dto.response.CheckoutSessionResponse;
import com.example.car_rental.dto.response.PaymentStatusResponse;

public interface StripeCheckoutService {

    CheckoutSessionResponse createCheckoutSession(String userEmail, CreateCheckoutSessionRequest request);

    void handleStripeWebhook(String payload, String stripeSignature);

    PaymentStatusResponse getBookingPaymentStatus(String userEmail, Integer bookingId);
}
