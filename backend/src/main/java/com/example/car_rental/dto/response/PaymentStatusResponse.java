package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentStatusResponse {
    private Integer bookingId;
    private Integer paymentId;
    private String bookingStatus;
    private String paymentStatus;
    private String provider;
    private String providerTxnId;
}
