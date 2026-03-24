package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ImageResponseDTO {
    String imageUrl;
    Boolean isPrimary;
}
