package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminReviewResponse {
    private Integer id;
    private Short rating;
    private String comment;
    private LocalDateTime createdAt;

    private Integer userId;
    private String userName;
    private String userEmail;

    private Integer vehicleId;
    private String vehicleName;
}