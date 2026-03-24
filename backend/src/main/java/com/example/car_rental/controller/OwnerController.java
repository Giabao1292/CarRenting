package com.example.car_rental.controller;


import com.example.car_rental.dto.request.OwnerRegisterDTO;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
@Validated
public class OwnerController {
    private final OwnerService ownerService;

    @PostMapping
    public ResponseData<String> registerOwner(@RequestPart("data") @Valid OwnerRegisterDTO ownerRegisterDTO,
                                              @RequestPart("idCardFront") MultipartFile idCardFront,
                                              @RequestPart("idCardBack") MultipartFile idCardBack, Authentication authentication) {

        ownerService.registerOwner(ownerRegisterDTO,idCardBack, idCardFront, authentication.getName());
        return new ResponseData<>(200, "Owner registered successfully");
    }
    @GetMapping("/me/status")
    public ResponseData<String> getStatus(Authentication authentication) {
        String status = ownerService.getStatus(authentication.getName());
        return new ResponseData<>(200, "Owner status retrieved successfully", status);
    }
}
