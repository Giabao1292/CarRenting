package com.example.car_rental.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class OwnerCreateVehicleRequest {
    private String licensePlate;
    private String brand;
    private String model;
    private Integer year;
    private String color;
    private String transmission;
    private Integer seating;
    private BigDecimal pricePerDay;
    private BigDecimal pricePerHour;
    private String locationAddress;
    private String locationCity;
    private List<Integer> featureIds;
}
