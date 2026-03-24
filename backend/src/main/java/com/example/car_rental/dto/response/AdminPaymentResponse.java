package com.example.car_rental.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminPaymentResponse {
    private Integer id;
    private Integer bookingId;
    private Integer userId;
    private String customerName;
    private String customerEmail;
    private BigDecimal amount;
    private String currency;
    private String provider;
    private String providerTxnId;
    private String status;
    private Instant createdAt;
}