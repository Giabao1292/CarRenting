package com.example.car_rental.controller;

import com.example.car_rental.dto.response.AdminCustomerResponse;
import com.example.car_rental.dto.response.AdminUserDashboardResponse;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.dto.response.UserLicenseProfileResponse;
import com.example.car_rental.dto.response.UserReportResponse;
import com.example.car_rental.service.ProfileLicenseService;
import com.example.car_rental.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ProfileLicenseService profileLicenseService;

    // View all user and block/unlock
    @GetMapping("/admin/customers")
    public ResponseData<Page<AdminCustomerResponse>> getAllCustomers(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AdminCustomerResponse> response = userService.getAllCustomers(keyword, page, size);
        return new ResponseData<>(200, "Get customers successfully", response);
    }

    @PutMapping("/admin/customers/{id}/block")
    public ResponseData<String> blockCustomer(@PathVariable Integer id) {
        userService.blockCustomer(id);
        return new ResponseData<>(200, "Customer blocked successfully", "Customer blocked successfully");
    }

    @PutMapping("/admin/customers/{id}/unlock")
    public ResponseData<String> unlockCustomer(@PathVariable Integer id) {
        userService.unlockCustomer(id);
        return new ResponseData<>(200, "Customer unlocked successfully", "Customer unlocked successfully");
    }

    // user report statistic
    @GetMapping("/admin/reports")
    public ResponseData<UserReportResponse> getUserReport() {
        UserReportResponse response = userService.getUserReport();
        return new ResponseData<>(200, "Get user report successfully", response);
    }

    @GetMapping("/admin/dashboardUser")
    public ResponseData<AdminUserDashboardResponse> getDashboard() {
        AdminUserDashboardResponse response = userService.getUserDashboard();
        return new ResponseData<>(200, "Get user dashboard successfully", response);
    }

    @GetMapping("/me/license")
    public ResponseData<UserLicenseProfileResponse> getMyLicenseProfile(Authentication authentication) {
        UserLicenseProfileResponse response = profileLicenseService.getMyLicenseProfile(authentication.getName());
        return new ResponseData<>(200, "Get license profile successfully", response);
    }

    @PostMapping("/me/license")
    public ResponseData<UserLicenseProfileResponse> submitMyLicenseProfile(
            @RequestParam("licenseNumber") String licenseNumber,
            @RequestParam(value = "frontImage", required = false) MultipartFile frontImage,
            @RequestParam(value = "backImage", required = false) MultipartFile backImage,
            Authentication authentication) {
        UserLicenseProfileResponse response = profileLicenseService.submitMyLicenseProfile(
                authentication.getName(),
                licenseNumber,
                frontImage,
                backImage);
        return new ResponseData<>(200, "Submit license profile successfully", response);
    }
}