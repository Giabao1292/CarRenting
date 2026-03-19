package com.example.car_rental.service;


import com.example.car_rental.util.TokenType;
import org.springframework.security.core.userdetails.UserDetails;



public interface JwtService {
    String generateToken(UserDetails userDetails);
    String generateRefreshToken(UserDetails userDetails);
    String extractUsername(String token, TokenType type);
}
