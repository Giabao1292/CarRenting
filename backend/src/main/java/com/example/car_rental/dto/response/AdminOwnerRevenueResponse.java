package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminOwnerRevenueResponse {
    private Integer ownerId;
    private String ownerName;
    private String ownerEmail;
    private BigDecimal revenue;
}