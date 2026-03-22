package com.example.car_rental.controller;

import com.example.car_rental.dto.response.AdminCustomerResponse;
import com.example.car_rental.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.car_rental.dto.response.UserReportResponse;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    // View all user and block/unlock
    @GetMapping("/admin/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AdminCustomerResponse> getAllCustomers(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userService.getAllCustomers(keyword, page, size);
    }

    @PutMapping("/admin/customers/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public String blockCustomer(@PathVariable Integer id) {
        userService.blockCustomer(id);
        return "Customer blocked successfully";
    }

    @PutMapping("/admin/customers/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public String unlockCustomer(@PathVariable Integer id) {
        userService.unlockCustomer(id);
        return "Customer unlocked successfully";
    }

    // user report static
    @GetMapping("/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public UserReportResponse getUserReport() {
        return userService.getUserReport();
    }

}