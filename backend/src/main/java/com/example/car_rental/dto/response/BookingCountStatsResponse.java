package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookingCountStatsResponse {
    private String time;
    private Long count;
}