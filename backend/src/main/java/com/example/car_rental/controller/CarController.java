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
    @GetMapping("/admin/summary")
    public AdminCarSummaryResponse getAdminCarSummary() {
        return vehicleService.getAdminCarSummary();
    }

    @GetMapping("/admin")
    public Page<AdminCarResponse> getAdminAllCars(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return vehicleService.getAdminAllCars(keyword, status, page, size);
    }

    @GetMapping("/admin/pending")
    public Page<AdminCarResponse> getAdminPendingCars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return vehicleService.getAdminPendingCars(page, size);
    }

    @GetMapping("/admin/{id}")
    public AdminCarDetailResponse getAdminCarDetail(@PathVariable Integer id) {
        return vehicleService.getAdminCarDetail(id);
    }

    @PutMapping("/admin/{id}/remove")
    public String adminRemoveCar(@PathVariable Integer id) {
        vehicleService.adminRemoveCar(id);
        return "Car removed successfully";
    }

    @PutMapping("/admin/{id}/approve")
    public String adminApproveCar(@PathVariable Integer id) {
        vehicleService.adminApproveCar(id);
        return "Car approved successfully";
    }

    @PutMapping("/admin/{id}/reject")
    public String adminRejectCar(@PathVariable Integer id,
                                 @Valid @RequestBody AdminRejectCarRequest request) {
        vehicleService.adminRejectCar(id, request);
        return "Car rejected successfully";
    }
}
