package com.example.car_rental.controller;

import com.example.car_rental.dto.response.PageResponse;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.dto.response.car.VehicleSummaryDTO;
import com.example.car_rental.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
@Validated
public class CarController {
    private final VehicleService vehicleService;
    @GetMapping
    public ResponseData<PageResponse<VehicleSummaryDTO>> searchCars(Pageable pageable, Authentication authentication, String... search){
        String userEmail = authentication == null ? null : authentication.getName();
        PageResponse<VehicleSummaryDTO> response = vehicleService.getCars(pageable, userEmail, search);
        return new ResponseData<>(200, "Get cars successfully", response);
    }
}
