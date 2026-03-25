package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OwnerVehicleImageResponse {
    private Integer id;
    private String imageUrl;
    private Boolean isPrimary;
}
