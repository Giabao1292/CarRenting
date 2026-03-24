package com.example.car_rental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminRejectCarRequest {
    @NotBlank(message = "Reason must not be blank")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
