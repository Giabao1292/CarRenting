package com.example.car_rental.service;

import com.example.car_rental.dto.request.LoginRequest;
import com.example.car_rental.dto.response.TokenResponse;
import org.springframework.stereotype.Service;

public interface AuthenticationService {
        TokenResponse authenticate(LoginRequest request);
//        UserTemp register(RegisterRequest request);
//        TokenResponse refreshToken(String refreshToken);
//
//        TokenResponse verifyTokenRegister(String verifyToken);
//
//        void handleForgotPassword(String email);
//
//        void resetPassword(String token, String newPassword);
//
//        String getUsername();

}
