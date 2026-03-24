package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminReviewDetailResponse {
    private Integer id;
    private Short rating;
    private String comment;
    private LocalDateTime createdAt;

    private Integer bookingId;

    private Integer userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    private Integer vehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private String licensePlate;
}