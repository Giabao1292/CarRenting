package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CheckoutSessionResponse {
    private Integer bookingId;
    private Integer paymentId;
    private String sessionId;
    private String checkoutUrl;
}
