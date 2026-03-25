package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AdminLicenseDetailResponse {
    private Integer id;
    private Integer userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String userAddress;
    private String docType;
    private String docNumber;
    private String fileUrl;
    private Boolean verified;
    private LocalDate expiryDate;
    private LocalDateTime createdAt;
    private String status;
    private String reason;
}