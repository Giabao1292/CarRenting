package com.example.car_rental.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminMonthlyRevenueResponse {
    private int month;
    private BigDecimal revenue;
}