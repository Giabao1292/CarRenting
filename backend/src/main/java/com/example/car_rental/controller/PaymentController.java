package com.example.car_rental.controller;

import com.example.car_rental.dto.response.AdminMonthlyRevenueResponse;
import com.example.car_rental.dto.response.AdminOwnerRevenueResponse;
import com.example.car_rental.dto.response.AdminPaymentResponse;
import com.example.car_rental.dto.response.AdminRevenueResponse;
import com.example.car_rental.dto.response.ResponseData;
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

    private final PaymentService paymentService;

    @GetMapping("/admin")
    public ResponseData<Page<AdminPaymentResponse>> getAllPayments(
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
        Page<AdminPaymentResponse> response = paymentService.getAllPayments(
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
        return new ResponseData<>(200, "Get payments successfully", response);
    }

    @GetMapping("/admin/revenue/today")
    public ResponseData<AdminRevenueResponse> getRevenueToday() {
        AdminRevenueResponse response = paymentService.getRevenueToday();
        return new ResponseData<>(200, "Get today's revenue successfully", response);
    }

    @GetMapping("/admin/revenue/date")
    public ResponseData<AdminRevenueResponse> getRevenueByDate(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        AdminRevenueResponse response = paymentService.getRevenueByDate(date);
        return new ResponseData<>(200, "Get revenue by date successfully", response);
    }

    @GetMapping("/admin/revenue/monthly")
    public ResponseData<List<AdminMonthlyRevenueResponse>> getMonthlyRevenue(
            @RequestParam Integer year
    ) {
        List<AdminMonthlyRevenueResponse> response = paymentService.getMonthlyRevenue(year);
        return new ResponseData<>(200, "Get monthly revenue successfully", response);
    }

    @GetMapping("/admin/revenue/owners")
    public ResponseData<List<AdminOwnerRevenueResponse>> getOwnerRevenue(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        List<AdminOwnerRevenueResponse> response = paymentService.getOwnerRevenue(fromDate, toDate);
        return new ResponseData<>(200, "Get owner revenue successfully", response);
    }
}