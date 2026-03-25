package com.example.car_rental.service;

import com.example.car_rental.dto.response.*;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {

        Page<AdminBookingResponse> getBookings(
                        String status,
                        String email,
                        Integer locationId,
                        LocalDate fromDate,
                        LocalDate toDate,
                        int page,
                        int size);

        AdminBookingDetailResponse getBookingDetail(Integer id);

        void completeBooking(Integer id);

        List<BookingCountStatsResponse> getBookingCountStats(
                        String groupBy,
                        LocalDate fromDate,
                        LocalDate toDate);

        List<BookingRevenueStatsResponse> getRevenueStats(
                        String groupBy,
                        LocalDate fromDate,
                        LocalDate toDate);

        List<BookingStatusStatsResponse> getBookingStatusStats(
                        LocalDate fromDate,
                        LocalDate toDate);

        List<TopBookedVehicleResponse> getTopBookedVehicles(int limit);

        List<OwnerBookingRequestResponse> getBookingRequest(String userEmail);

        List<MyTripResponse> getMyTrips(String userEmail);
}