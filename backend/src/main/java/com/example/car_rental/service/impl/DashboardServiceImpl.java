package com.example.car_rental.service.impl;

import com.example.car_rental.dto.response.AdminDashboardResponse;
import com.example.car_rental.dto.response.AdminTopBookedVehicleResponse;
import com.example.car_rental.repository.DashboardRepository;
import com.example.car_rental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DashboardRepository adminDashboardRepository;

    @Override
    public AdminDashboardResponse getAdminDashboard() {
        Long totalUsers = defaultLong(adminDashboardRepository.countTotalUsers());
        Long totalOwners = defaultLong(adminDashboardRepository.countTotalOwners());
        Long totalAvailableCars = defaultLong(adminDashboardRepository.countTotalAvailableCars());
        BigDecimal revenueThisMonth = defaultBigDecimal(adminDashboardRepository.getRevenueThisMonth());

        List<AdminTopBookedVehicleResponse> topBookedVehicles = adminDashboardRepository.getTop5MostBookedVehicles()
                .stream()
                .map(this::mapToAdminTopBookedVehicleResponse)
                .toList();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalOwners(totalOwners)
                .totalAvailableCars(totalAvailableCars)
                .revenueThisMonth(revenueThisMonth)
                .topBookedVehicles(topBookedVehicles)
                .build();
    }

    private AdminTopBookedVehicleResponse mapToAdminTopBookedVehicleResponse(Object[] row) {
        Integer vehicleId = row[0] != null ? ((Number) row[0]).intValue() : null;
        String vehicleName = row[1] != null ? row[1].toString() : "";
        String licensePlate = row[2] != null ? row[2].toString() : "";
        String ownerName = row[3] != null ? row[3].toString() : "";
        String imageUrl = row[4] != null ? row[4].toString() : "";
        Long totalBookings = row[5] != null ? ((Number) row[5]).longValue() : 0L;
        BigDecimal totalRevenue = row[6] != null ? new BigDecimal(row[6].toString()) : BigDecimal.ZERO;

        return AdminTopBookedVehicleResponse.builder()
                .vehicleId(vehicleId)
                .vehicleName(vehicleName)
                .licensePlate(licensePlate)
                .ownerName(ownerName)
                .imageUrl(imageUrl)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .build();
    }

    private Long defaultLong(Long value) {
        return value != null ? value : 0L;
    }

    private BigDecimal defaultBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}