package com.example.car_rental.service.impl;

import com.example.car_rental.dto.response.AdminMonthlyRevenueResponse;
import com.example.car_rental.dto.response.AdminOwnerRevenueResponse;
import com.example.car_rental.dto.response.AdminPaymentResponse;
import com.example.car_rental.dto.response.AdminRevenueResponse;
import com.example.car_rental.model.Booking;
import com.example.car_rental.model.Payment;
import com.example.car_rental.model.User;
import com.example.car_rental.repository.PaymentRepository;
import com.example.car_rental.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Override
    public Page<AdminPaymentResponse> getAllPayments(
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
    ) {
        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy
        );

        Pageable pageable = PageRequest.of(page, size, sort);

        Instant fromInstant = toStartOfDayInstant(fromDate);
        Instant toInstant = toStartOfNextDayInstant(toDate);

        Page<Payment> paymentPage = paymentRepository.searchAdminPayments(
                providerTxnId,
                provider,
                status,
                bookingId,
                userId,
                fromInstant,
                toInstant,
                pageable
        );

        return paymentPage.map(this::mapToAdminPaymentResponse);
    }

    @Override
    public AdminRevenueResponse getRevenueToday() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        return getRevenueByDate(today);
    }

    @Override
    public AdminRevenueResponse getRevenueByDate(LocalDate date) {
        Instant start = toStartOfDayInstant(date);
        Instant end = toStartOfNextDayInstant(date);

        BigDecimal revenue = paymentRepository.getRevenueBetween(start, end);
        if (revenue == null) {
            revenue = BigDecimal.ZERO;
        }

        return new AdminRevenueResponse(date, revenue);
    }

    @Override
    public List<AdminMonthlyRevenueResponse> getMonthlyRevenue(Integer year) {
        List<Object[]> rawData = paymentRepository.getMonthlyRevenue(year);

        Map<Integer, BigDecimal> revenueMap = new HashMap<>();
        for (Object[] row : rawData) {
            Integer month = ((Number) row[0]).intValue();
            BigDecimal revenue = toBigDecimal(row[1]);
            revenueMap.put(month, revenue);
        }

        List<AdminMonthlyRevenueResponse> response = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            response.add(new AdminMonthlyRevenueResponse(
                    month,
                    revenueMap.getOrDefault(month, BigDecimal.ZERO)
            ));
        }

        return response;
    }

    @Override
    public List<AdminOwnerRevenueResponse> getOwnerRevenue(LocalDate fromDate, LocalDate toDate) {
        Instant fromInstant = toStartOfDayInstant(fromDate);
        Instant toInstant = toStartOfNextDayInstant(toDate);

        List<Object[]> rawData = paymentRepository.getOwnerRevenue(fromInstant, toInstant);

        List<AdminOwnerRevenueResponse> response = new ArrayList<>();
        for (Object[] row : rawData) {
            response.add(new AdminOwnerRevenueResponse(
                    ((Number) row[0]).intValue(),
                    (String) row[1],
                    (String) row[2],
                    toBigDecimal(row[3])
            ));
        }

        return response;
    }

    private AdminPaymentResponse mapToAdminPaymentResponse(Payment payment) {
        Booking booking = payment.getBooking();
        User user = payment.getUser();

        return AdminPaymentResponse.builder()
                .id(payment.getId())
                .bookingId(booking != null ? booking.getId() : null)
                .userId(user != null ? user.getId() : null)
                .customerName(user != null ? user.getFullName() : null)
                .customerEmail(user != null ? user.getEmail() : null)
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .provider(payment.getProvider())
                .providerTxnId(payment.getProviderTxnId())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private Instant toStartOfDayInstant(LocalDate date) {
        if (date == null) return null;
        return date.atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private Instant toStartOfNextDayInstant(LocalDate date) {
        if (date == null) return null;
        return date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        return new BigDecimal(value.toString());
    }
}