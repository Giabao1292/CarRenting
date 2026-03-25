package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminOwnerDetailResponse {
    private Integer id; // owner_profile id
    private Integer userId;

    private String fullName;
    private String email;
    private String phone;

    private String ownerType;
    private String residencyType;

    private String city;
    private String address;
    private String idNumber;

    private String idCardFrontUrl;
    private String idCardBackUrl;

    private String verificationStatus; // PENDING / APPROVED / REJECTED
    private String reviewNote;

    private Boolean userVerified;
    private String userRole;
    private Boolean userDeleted;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}