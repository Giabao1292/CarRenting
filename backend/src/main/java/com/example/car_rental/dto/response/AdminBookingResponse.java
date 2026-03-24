package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminBookingResponse {
    private Integer id;
    private String bookingCode;

    private String customerName;
    private String customerEmail;

    private String pickupLocation;
    private LocalDateTime pickupAt;
    private LocalDateTime dropoffAt;

    private BigDecimal totalAmount;
    private String status;

    private LocalDateTime createdAt;
}