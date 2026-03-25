package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class UserLicenseProfileResponse {
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dob;
    private String address;

    private String licenseNumber;
    private String licenseFrontUrl;
    private String licenseBackUrl;
    private String verificationStatus;
    private Boolean verified;
    private LocalDateTime submittedAt;
}
