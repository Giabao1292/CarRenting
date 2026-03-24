package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminCarDetailResponse {
    private Integer id;
    private String licensePlate;
    private String brand;
    private String model;
    private Integer year;
    private String color;
    private BigDecimal pricePerDay;
    private String status;
    private String rejectionReason;

    private Integer ownerId;
    private String ownerName;
    private String ownerEmail;

    private Integer vehicleTypeId;
    private String vehicleTypeName;

    private Integer locationId;
    private String locationName;
    private String locationAddress;

    private List<String> images;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}