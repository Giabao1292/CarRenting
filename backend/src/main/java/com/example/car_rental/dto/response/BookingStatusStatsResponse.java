package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookingStatusStatsResponse {
    private String status;
    private Long count;
}