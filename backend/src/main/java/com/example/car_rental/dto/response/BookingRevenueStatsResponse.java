package com.example.car_rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BookingRevenueStatsResponse {
    private String time;
    private BigDecimal revenue;
}