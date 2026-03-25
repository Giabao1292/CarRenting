package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminOwnerSummaryResponse {
    private long totalRequests;
    private long pendingOwners;
    private long approvedOwners;
    private long rejectedOwners;
}