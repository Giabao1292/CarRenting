package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminCarResponse {
    private Integer id;
    private String thumbnail;
    private String licensePlate;
    private String brand;
    private String model;
    private BigDecimal pricePerDay;
    private String status;
}
