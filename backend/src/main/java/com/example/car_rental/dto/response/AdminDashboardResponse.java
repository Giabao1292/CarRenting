package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private Long totalUsers;
    private Long totalOwners;
    private Long totalAvailableCars;
    private BigDecimal revenueThisMonth;
    private List<AdminTopBookedVehicleResponse> topBookedVehicles;
}