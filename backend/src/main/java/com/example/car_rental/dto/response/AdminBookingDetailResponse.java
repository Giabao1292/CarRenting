package com.example.car_rental.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminBookingDetailResponse {
    private Integer id;
    private String bookingCode;
    private String status;
    private LocalDateTime pickupAt;
    private LocalDateTime dropoffAt;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;

    private CustomerInfo customer;
    private LocationInfo pickupLocation;
    private LocationInfo dropoffLocation;
    private List<BookingItemInfo> items;
    private PaymentInfo payment;
    private PromotionInfo promotion;

    @Data
    @Builder
    public static class CustomerInfo {
        private Integer id;
        private String fullName;
        private String email;
        private String phone;
        private String avatar;
    }

    @Data
    @Builder
    public static class LocationInfo {
        private Integer id;
        private String name;
        private String address;
    }

    @Data
    @Builder
    public static class BookingItemInfo {
        private Integer bookingItemId;
        private Integer vehicleId;
        private String vehicleName;
        private BigDecimal pricePerDay;
        private Integer quantity;
        private BigDecimal subtotal;
    }

    @Data
    @Builder
    public static class PaymentInfo {
        private Integer id;
        private BigDecimal amount;
        private String method;
        private String status;
        private LocalDateTime paidAt;
    }

    @Data
    @Builder
    public static class PromotionInfo {
        private Integer id;
        private String code;
        private BigDecimal discountAmount;
    }
}