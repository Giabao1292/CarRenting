package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class FeatureResponseDTO {
    private Integer id;
    private String name;
    private String icon;
}
