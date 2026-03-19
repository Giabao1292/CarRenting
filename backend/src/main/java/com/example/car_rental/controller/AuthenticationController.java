package com.example.car_rental.controller;

import com.example.car_rental.dto.request.LoginRequest;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.dto.response.TokenResponse;
import com.example.car_rental.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthenticationController {
    @Autowired
    private AuthenticationService authService;

    @PostMapping("/login")
    public ResponseData<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokenResponse = authService.authenticate(request);
        return new ResponseData<>(HttpStatus.OK.value(), "Login successfully", tokenResponse);
    }
}
