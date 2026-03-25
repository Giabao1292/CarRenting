package com.example.car_rental.dto.response;

import jakarta.persistence.Entity;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String role;
    private String avatar;
    private String email;
}
