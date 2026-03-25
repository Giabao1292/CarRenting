package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTopBookedVehicleResponse {
    private Integer vehicleId;
    private String vehicleName;
    private String licensePlate;
    private String ownerName;
    private String imageUrl;
    private Long totalBookings;
    private BigDecimal totalRevenue;
}