package com.example.car_rental.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDashboardResponse {
    private long totalUsers;
    private long activeUsers;
    private long blockedUsers;
    private long verifiedUsers;
}