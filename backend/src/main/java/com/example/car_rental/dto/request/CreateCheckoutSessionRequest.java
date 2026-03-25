package com.example.car_rental.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class CreateCheckoutSessionRequest {

    @NotNull(message = "vehicleId is required")
    @Positive(message = "vehicleId must be positive")
    private Integer vehicleId;

    @Positive(message = "pickupLocationId must be positive")
    private Integer pickupLocationId;

    @Positive(message = "dropoffLocationId must be positive")
    private Integer dropoffLocationId;

    @NotNull(message = "pickupAt is required")
    private Instant pickupAt;

    @NotNull(message = "dropoffAt is required")
    private Instant dropoffAt;

    @NotNull(message = "totalAmount is required")
    @DecimalMin(value = "1", message = "totalAmount must be greater than 0")
    private BigDecimal totalAmount;

    @Size(max = 10, message = "currency length must be <= 10")
    private String currency = "VND";

    @Size(max = 100, message = "locationCity length must be <= 100")
    private String locationCity;

    @Size(max = 500, message = "locationAddress length must be <= 500")
    private String locationAddress;

    private Double locationLat;

    private Double locationLng;
}
