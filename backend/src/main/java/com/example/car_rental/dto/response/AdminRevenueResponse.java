package com.example.car_rental.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminRevenueResponse {
    private LocalDate date;
    private BigDecimal revenue;
}