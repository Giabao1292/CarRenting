package com.example.car_rental.controller;

import com.example.car_rental.dto.request.AdminRejectCarRequest;
import com.example.car_rental.dto.response.*;
import com.example.car_rental.dto.response.car.VehicleDetailDTO;
import com.example.car_rental.dto.response.car.VehicleSummaryDTO;
import com.example.car_rental.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
    @GetMapping("/admin/summary")
    public ResponseData<AdminCarSummaryResponse> getAdminCarSummary() {
        AdminCarSummaryResponse response = vehicleService.getAdminCarSummary();
        return new ResponseData<>(200, "Get car summary successfully", response);
    }

    @GetMapping("/admin")
    public ResponseData<Page<AdminCarResponse>> getAdminAllCars(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminCarResponse> response = vehicleService.getAdminAllCars(keyword, status, page, size);
        return new ResponseData<>(200, "Get all cars successfully", response);
    }

    @GetMapping("/admin/pending")
    public ResponseData<Page<AdminCarResponse>> getAdminPendingCars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminCarResponse> response = vehicleService.getAdminPendingCars(page, size);
        return new ResponseData<>(200, "Get pending cars successfully", response);
    }

    @GetMapping("/admin/{id}")
    public ResponseData<AdminCarDetailResponse> getAdminCarDetail(@PathVariable Integer id) {
        AdminCarDetailResponse response = vehicleService.getAdminCarDetail(id);
        return new ResponseData<>(200, "Get car detail successfully", response);
    }

    @PutMapping("/admin/{id}/remove")
    public ResponseData<String> adminRemoveCar(@PathVariable Integer id) {
        vehicleService.adminRemoveCar(id);
        return new ResponseData<>(200, "Car removed successfully");
    }

    @PutMapping("/admin/{id}/approve")
    public ResponseData<String> adminApproveCar(@PathVariable Integer id) {
        vehicleService.adminApproveCar(id);
        return new ResponseData<>(200, "Car approved successfully");
    }

    @PutMapping("/admin/{id}/reject")
    public ResponseData<String> adminRejectCar(
            @PathVariable Integer id,
            @Valid @RequestBody AdminRejectCarRequest request
    ) {
        vehicleService.adminRejectCar(id, request);
        return new ResponseData<>(200, "Car rejected successfully");
    }
}
