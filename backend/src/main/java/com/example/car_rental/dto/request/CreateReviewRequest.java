package com.example.car_rental.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReviewRequest {

    @NotNull(message = "bookingId is required")
    @Positive(message = "bookingId must be positive")
    private Integer bookingId;

    @NotNull(message = "vehicleId is required")
    @Positive(message = "vehicleId must be positive")
    private Integer vehicleId;

    @NotNull(message = "rating is required")
    @Min(value = 1, message = "rating must be at least 1")
    @Max(value = 5, message = "rating must be at most 5")
    private Short rating;

    @NotNull(message = "comment is required")
    @Size(min = 5, max = 2000, message = "comment length must be between 5 and 2000")
    private String comment;
}
