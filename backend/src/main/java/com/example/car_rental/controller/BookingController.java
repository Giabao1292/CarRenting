package com.example.car_rental.controller;

import com.example.car_rental.dto.response.*;
import com.example.car_rental.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/admin")
    public Page<AdminBookingResponse> getBookings(
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
        return bookingService.getBookings(
                status, email, locationId, fromDate, toDate, page, size
        );
    }

    @GetMapping("/admin/{id}")
    public AdminBookingDetailResponse getBookingDetail(@PathVariable Integer id) {
        return bookingService.getBookingDetail(id);
    }

    @PutMapping("/admin/{id}/complete")
    public Map<String, Object> completeBooking(@PathVariable Integer id) {
        bookingService.completeBooking(id);
        return Map.of(
                "message", "Booking completed successfully",
                "bookingId", id,
                "status", "completed"
        );
    }

    @GetMapping("/admin/stats/count")
    public List<BookingCountStatsResponse> getBookingCountStats(
            @RequestParam(defaultValue = "month") String groupBy,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return bookingService.getBookingCountStats(groupBy, fromDate, toDate);
    }

    @GetMapping("/admin/stats/revenue")
    public List<BookingRevenueStatsResponse> getRevenueStats(
            @RequestParam(defaultValue = "month") String groupBy,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return bookingService.getRevenueStats(groupBy, fromDate, toDate);
    }

    @GetMapping("/admin/stats/status")
    public List<BookingStatusStatsResponse> getBookingStatusStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return bookingService.getBookingStatusStats(fromDate, toDate);
    }

    @GetMapping("/admin/stats/top")
    public List<TopBookedVehicleResponse> getTopBookedVehicles(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return bookingService.getTopBookedVehicles(limit);
    }
}