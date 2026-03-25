package com.example.car_rental.controller;

import com.example.car_rental.dto.request.LoginRequest;
import com.example.car_rental.dto.request.RegisterRequest;
import com.example.car_rental.dto.request.ChangePasswordRequest;
import com.example.car_rental.dto.request.VerifyRequestDTO;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.dto.response.TokenResponse;
import com.example.car_rental.service.AuthenticationService;
import com.example.car_rental.service.MailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthenticationController {
    @Autowired
    private AuthenticationService authService;
    @Autowired
    private MailService mailService;

    @PostMapping("/login")
    public ResponseData<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokenResponse = authService.authenticate(request);
        return new ResponseData<>(HttpStatus.OK.value(), "Login successfully", tokenResponse);
    }

    @PostMapping("/register")
    public ResponseData<String> register(@Valid @RequestBody RegisterRequest request) {
        String token = authService.register(request);
        mailService.sendVerificationEmail(request.getEmail(), token);
        return new ResponseData<>(HttpStatus.OK.value(), "Register successfully user check email");
    }

    @PostMapping("/verify")
    public ResponseData<TokenResponse> verifyEmail(@RequestBody VerifyRequestDTO verifyRequestDTO) {
        TokenResponse tokenResponse = authService.verifyTokenRegister(verifyRequestDTO);
        return new ResponseData<>(HttpStatus.OK.value(), "Verify successfully", tokenResponse);
    }

    @PostMapping("/change-password")
    public ResponseData<String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return new ResponseData<>(HttpStatus.UNAUTHORIZED.value(), "Unauthorized");
        }

        authService.changePassword(authentication.getName(), request);
        return new ResponseData<>(HttpStatus.OK.value(), "Change password successfully");
    }
}
