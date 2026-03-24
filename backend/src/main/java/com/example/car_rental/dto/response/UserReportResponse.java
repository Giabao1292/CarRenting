package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserReportResponse {

    // Growth
    private long newCustomers7d;
    private long newOwners7d;
    private long newCustomers30d;
    private long newOwners30d;

    // Active
    private long totalActive;
    private long activeCustomers;
    private long activeOwners;

    // Inactive
    private long totalInactive;
    private long inactiveCustomers;
    private long inactiveOwners;
}