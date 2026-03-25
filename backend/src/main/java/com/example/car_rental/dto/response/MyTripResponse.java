package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class MyTripResponse {
    private Integer bookingId;
    private String bookingCode;
    private String status;
    private LocalDateTime pickupAt;
    private LocalDateTime dropoffAt;
    private LocalDateTime createdAt;
    private BigDecimal totalAmount;
    private String currency;

    private Integer vehicleId;
    private String vehicleName;
    private String vehicleImageUrl;
    private String ownerPhone;

    private String pickupLocation;
    private Integer reviewId;
    private Short reviewRating;
    private String reviewComment;
}
