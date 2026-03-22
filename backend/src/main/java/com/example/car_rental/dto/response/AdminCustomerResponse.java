package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class AdminCustomerResponse {
    private Integer id;
    private String email;
    private String fullName;
    private String phone;
    private Boolean verified;
    private Boolean isDeleted;
    private Instant createdAt;
    private Instant updatedAt;
}