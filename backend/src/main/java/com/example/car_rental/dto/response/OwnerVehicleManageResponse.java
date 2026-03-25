package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class OwnerVehicleManageResponse {
    private Integer id;
    private String status;
    private String rejectionReason;
    private String licensePlate;
    private String brand;
    private String model;
    private Integer year;
    private String color;
    private String transmission;
    private BigDecimal pricePerDay;
    private BigDecimal pricePerHour;
    private String locationName;
    private String locationAddress;
    private List<OwnerVehicleImageResponse> images;
}
