package com.example.car_rental.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Email must be not blank")
    private String email;

    @NotBlank(message = "Password must be not blank")
    private String password;
}
