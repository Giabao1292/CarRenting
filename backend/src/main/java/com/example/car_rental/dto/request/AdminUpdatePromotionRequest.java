package com.example.car_rental.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Data
public class AdminUpdatePromotionRequest {

    @NotBlank(message = "Code must not be blank")
    @Size(max = 50, message = "Code must be less than or equal to 50 characters")
    private String code;

    @NotBlank(message = "Discount type must not be blank")
    private String discountType;

    @NotNull(message = "Discount value must not be null")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    @Positive(message = "Usage limit must be greater than 0")
    private Integer usageLimit;

}