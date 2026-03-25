package com.example.car_rental.service;

import com.example.car_rental.dto.request.LoginRequest;
import com.example.car_rental.dto.response.TokenResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

public interface AuthenticationService {
        TokenResponse authenticate(LoginRequest request);

        TokenResponse authenticateGoogleUser(OAuth2User oauth2User);
        // UserTemp register(RegisterRequest request);
        // TokenResponse refreshToken(String refreshToken);
        //
        // TokenResponse verifyTokenRegister(String verifyToken);
        //
        // void handleForgotPassword(String email);
        //
        // void resetPassword(String token, String newPassword);
        //
        // String getUsername();

}
