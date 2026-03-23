package com.example.car_rental.dto.response.car;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VehicleSummaryDTO {
    private Integer id;
    private String name;           // "Kia Seltos 2024"
    private String location;           // "Thành Phố Thủ Đức"
    private BigDecimal pricePerDay;        // 920K
    private BigDecimal originalPricePerDay;// 1100K (giá gốc bị gạch)
    private Integer discountPercent;       // 17 (%)
    private Integer seats;         // 5
    private String transmission;   // "Số tự động"
    private String imageUrl;
    private Double rating;
}