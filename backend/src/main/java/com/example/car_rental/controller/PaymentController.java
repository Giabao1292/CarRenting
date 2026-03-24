package com.example.car_rental.controller;

import com.example.car_rental.dto.response.AdminMonthlyRevenueResponse;
import com.example.car_rental.dto.response.AdminOwnerRevenueResponse;
import com.example.car_rental.dto.response.AdminPaymentResponse;
import com.example.car_rental.dto.response.AdminRevenueResponse;
import com.example.car_rental.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService adminPaymentService;

    @GetMapping("/admin")
    public Page<AdminPaymentResponse> getAllPayments(
            @RequestParam(required = false) String providerTxnId,
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer bookingId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return adminPaymentService.getAllPayments(
                providerTxnId,
                provider,
                status,
                bookingId,
                userId,
                fromDate,
                toDate,
                page,
                size,
                sortBy,
                sortDir
        );
    }

    @GetMapping("/admin/revenue/today")
    public AdminRevenueResponse getRevenueToday() {
        return adminPaymentService.getRevenueToday();
    }

    @GetMapping("/admin/revenue/date")
    public AdminRevenueResponse getRevenueByDate(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return adminPaymentService.getRevenueByDate(date);
    }

    @GetMapping("/admin/revenue/monthly")
    public List<AdminMonthlyRevenueResponse> getMonthlyRevenue(
            @RequestParam Integer year
    ) {
        return adminPaymentService.getMonthlyRevenue(year);
    }

    @GetMapping("/admin/revenue/owners")
    public List<AdminOwnerRevenueResponse> getOwnerRevenue(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return adminPaymentService.getOwnerRevenue(fromDate, toDate);
    }
}