package com.example.car_rental.controller;

import com.example.car_rental.dto.response.AdminDashboardResponse;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService adminDashboardService;

    @GetMapping
    public ResponseData<AdminDashboardResponse> getAdminDashboard() {
        AdminDashboardResponse response = adminDashboardService.getAdminDashboard();
        return new ResponseData<>(200, "Get admin dashboard successfully", response);
    }
}