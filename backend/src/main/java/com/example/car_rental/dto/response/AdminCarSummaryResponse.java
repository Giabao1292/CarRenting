package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

// Dashboard DTO
public class AdminCarSummaryResponse {
    private long totalCars;
    private long availableCars;
    private long rejectedCars;
    private long unavailableCars;
}
