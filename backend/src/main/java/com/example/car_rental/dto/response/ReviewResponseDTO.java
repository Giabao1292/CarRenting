package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Builder
@Data
public class ReviewResponseDTO {
    private String comment;
    private String reviewerName;
    private String avtUrl;
    private LocalDateTime createdAt;
    private Integer rating;
}
