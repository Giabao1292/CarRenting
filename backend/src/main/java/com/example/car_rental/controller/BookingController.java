package com.example.car_rental.controller;

import com.example.car_rental.dto.response.*;
import com.example.car_rental.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/admin")
    public ResponseData<Page<AdminBookingResponse>> getBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Integer locationId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminBookingResponse> response = bookingService.getBookings(
                status, email, locationId, fromDate, toDate, page, size
        );
        return new ResponseData<>(200, "Get bookings successfully", response);
    }

    @GetMapping("/admin/{id}")
    public ResponseData<AdminBookingDetailResponse> getBookingDetail(@PathVariable Integer id) {
        AdminBookingDetailResponse response = bookingService.getBookingDetail(id);
        return new ResponseData<>(200, "Get booking detail successfully", response);
    }

    @PutMapping("/admin/{id}/complete")
    public ResponseData<String> completeBooking(@PathVariable Integer id) {
        bookingService.completeBooking(id);
        return new ResponseData<>(200, "Complete booking successfully");
    }

    @GetMapping("/admin/stats/count")
    public ResponseData<List<BookingCountStatsResponse>> getBookingCountStats(
            @RequestParam(defaultValue = "month") String groupBy,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        List<BookingCountStatsResponse> response =
                bookingService.getBookingCountStats(groupBy, fromDate, toDate);
        return new ResponseData<>(200, "Get booking count statistics successfully", response);
    }

    @GetMapping("/admin/stats/revenue")
    public ResponseData<List<BookingRevenueStatsResponse>> getRevenueStats(
            @RequestParam(defaultValue = "month") String groupBy,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        List<BookingRevenueStatsResponse> response =
                bookingService.getRevenueStats(groupBy, fromDate, toDate);
        return new ResponseData<>(200, "Get booking revenue statistics successfully", response);
    }

    @GetMapping("/admin/stats/status")
    public ResponseData<List<BookingStatusStatsResponse>> getBookingStatusStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        List<BookingStatusStatsResponse> response =
                bookingService.getBookingStatusStats(fromDate, toDate);
        return new ResponseData<>(200, "Get booking status statistics successfully", response);
    }

    @GetMapping("/admin/stats/top")
    public ResponseData<List<TopBookedVehicleResponse>> getTopBookedVehicles(
            @RequestParam(defaultValue = "5") int limit
    ) {
        List<TopBookedVehicleResponse> response = bookingService.getTopBookedVehicles(limit);
        return new ResponseData<>(200, "Get top booked vehicles successfully", response);
    }

    @GetMapping
    public ResponseData<List<OwnerBookingRequestResponse>> getBookingRequest(Authentication authentication) {
        List<OwnerBookingRequestResponse> bookingResponses =  bookingService.getBookingRequest(authentication.getName());
        return new ResponseData<>(200, "Get booking requests successfully", bookingResponses);
    }
}