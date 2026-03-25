package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OwnerBookingRequestResponse {

    private Integer vehicleId;

    private Integer bookingId;

    private String customerEmail;

    private LocalDateTime pickupAt;

    private LocalDateTime dropoffAt;

    private BigDecimal totalAmount;

    private String status;

    private LocalDateTime createdAt;

    private String vehicleName;

    private String imageUrl;

}
