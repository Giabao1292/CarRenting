package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminOwnerResponse {
    private Integer id; // owner_profile id
    private Integer userId;

    private String fullName;
    private String email;
    private String phone;

    private String city;
    private String ownerType;
    private String residencyType;

    private String verificationStatus; // PENDING / APPROVED / REJECTED
    private String reviewNote;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}