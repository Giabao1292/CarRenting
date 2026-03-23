package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopBookedVehicleResponse {
    private String vehicle;
    private Long count;
}