package com.example.car_rental.service;

import com.example.car_rental.dto.request.LoginRequest;
import com.example.car_rental.dto.request.RegisterRequest;
import com.example.car_rental.dto.request.VerifyRequestDTO;
import com.example.car_rental.dto.response.TokenResponse;
import com.example.car_rental.model.User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

public interface AuthenticationService {
        TokenResponse authenticate(LoginRequest request);

        TokenResponse authenticateGoogleUser(OAuth2User oauth2User);
        String register(RegisterRequest request);
        TokenResponse verifyTokenRegister(VerifyRequestDTO verifyRequestDTO);
        // TokenResponse refreshToken(String refreshToken);

        // void handleForgotPassword(String email);
        //
        // void resetPassword(String token, String newPassword);
        //
        // String getUsername();

}
