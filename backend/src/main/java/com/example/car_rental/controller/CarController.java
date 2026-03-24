package com.example.car_rental.controller;

import com.example.car_rental.dto.response.PageResponse;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.dto.response.car.VehicleDetailDTO;
import com.example.car_rental.dto.response.car.VehicleSummaryDTO;
import com.example.car_rental.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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
    @GetMapping("/{id}")
    public ResponseData<VehicleDetailDTO> getCarsById(@PathVariable Integer id) {
        VehicleDetailDTO response = vehicleService.getCarDetail(id);
        return new ResponseData<>(200, "Get cars successfully", response);
    }
    @GetMapping("/me")
    public ResponseData<List<VehicleSummaryDTO>> getCarsOwner(Authentication authentication){
        List<VehicleSummaryDTO> response = vehicleService.getCarsByOwner(authentication.getName());
        return new ResponseData<>(200, "Get cars successfully", response);
    }
    @PatchMapping("/{id}")
    public ResponseData<String> updateCarStatus(@PathVariable Integer id, @RequestParam String status, Authentication authentication) {
        vehicleService.updateCarStatus(id, status, authentication.getName());
        return new ResponseData<>(200, "Car status updated successfully");
    }
}
