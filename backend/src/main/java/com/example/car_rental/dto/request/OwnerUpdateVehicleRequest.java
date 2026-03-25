package com.example.car_rental.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OwnerUpdateVehicleRequest {
    private String licensePlate;
    private String brand;
    private String model;
    private Integer year;
    private String color;
    private String transmission;
    private BigDecimal pricePerDay;
    private BigDecimal pricePerHour;
}
