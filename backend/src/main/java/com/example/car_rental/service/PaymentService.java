package com.example.car_rental.service;

import com.example.car_rental.dto.response.AdminMonthlyRevenueResponse;
import com.example.car_rental.dto.response.AdminOwnerRevenueResponse;
import com.example.car_rental.dto.response.AdminPaymentResponse;
import com.example.car_rental.dto.response.AdminRevenueResponse;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface PaymentService {

    Page<AdminPaymentResponse> getAllPayments(
            String providerTxnId,
            String provider,
            String status,
            Integer bookingId,
            Integer userId,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    AdminRevenueResponse getRevenueToday();

    AdminRevenueResponse getRevenueByDate(LocalDate date);

    List<AdminMonthlyRevenueResponse> getMonthlyRevenue(Integer year);

    List<AdminOwnerRevenueResponse> getOwnerRevenue(LocalDate fromDate, LocalDate toDate);
}