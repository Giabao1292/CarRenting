package com.example.car_rental.service.impl;

import com.example.car_rental.dto.response.AdminUserDashboardResponse;
import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.model.User;
import com.example.car_rental.repository.UserRepository;
import com.example.car_rental.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.car_rental.dto.response.AdminCustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.example.car_rental.dto.response.UserReportResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User findByEmail(String email) {
        return userRepository.findUserByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Wrong username or password"));
    }

    @Override
    public Page<AdminCustomerResponse> getAllCustomers(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        return userRepository.findAllCustomers(keyword, pageable)
                .map(this::mapToAdminCustomerResponse);
    }

    @Override
    public void blockCustomer(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        if (!"customer".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("User is not customer");
        }

        user.setIsDeleted(true);
        userRepository.save(user);
    }

    @Override
    public void unlockCustomer(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        if (!"customer".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("User is not customer");
        }

        user.setIsDeleted(false);
        userRepository.save(user);
    }

    private AdminCustomerResponse mapToAdminCustomerResponse(User user) {
        return AdminCustomerResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .verified(user.getVerified())
                .isDeleted(user.getIsDeleted())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
    @Override
    public UserReportResponse getUserReport() {

        Instant now = Instant.now();

        Instant last7Days = now.minus(7, ChronoUnit.DAYS);
        Instant last30Days = now.minus(30, ChronoUnit.DAYS);

        // Growth
        long newCustomers7d = userRepository.countByRoleAndCreatedAtAfter("customer", last7Days);
        long newOwners7d = userRepository.countByRoleAndCreatedAtAfter("owner", last7Days);

        long newCustomers30d = userRepository.countByRoleAndCreatedAtAfter("customer", last30Days);
        long newOwners30d = userRepository.countByRoleAndCreatedAtAfter("owner", last30Days);

        // Active
        long totalActive = userRepository.countByIsDeletedFalseAndVerifiedTrue();
        long activeCustomers = userRepository.countByRoleAndIsDeletedFalseAndVerifiedTrue("customer");
        long activeOwners = userRepository.countByRoleAndIsDeletedFalseAndVerifiedTrue("owner");

        // Inactive
        long totalInactive = userRepository.countByIsDeletedTrueOrVerifiedFalse();
        long inactiveCustomers = userRepository.countByRoleAndIsDeletedTrueOrVerifiedFalse("customer");
        long inactiveOwners = userRepository.countByRoleAndIsDeletedTrueOrVerifiedFalse("owner");

        return UserReportResponse.builder()
                .newCustomers7d(newCustomers7d)
                .newOwners7d(newOwners7d)
                .newCustomers30d(newCustomers30d)
                .newOwners30d(newOwners30d)
                .totalActive(totalActive)
                .activeCustomers(activeCustomers)
                .activeOwners(activeOwners)
                .totalInactive(totalInactive)
                .inactiveCustomers(inactiveCustomers)
                .inactiveOwners(inactiveOwners)
                .build();
    }


    @Override
    public void saveAvatar(String avatarUrl, String email) {
        User user = userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + email));
        user.setAvatar(avatarUrl);
        userRepository.save(user);
    }
    @Override
    public AdminUserDashboardResponse getUserDashboard() {
        List<Object[]> results = userRepository.getUserDashboard();

        if (results == null || results.isEmpty()) {
            return AdminUserDashboardResponse.builder()
                    .totalUsers(0)
                    .activeUsers(0)
                    .blockedUsers(0)
                    .verifiedUsers(0)
                    .build();
        }

        Object[] row = results.get(0);

        return AdminUserDashboardResponse.builder()
                .totalUsers(((Number) row[0]).longValue())
                .activeUsers(((Number) row[1]).longValue())
                .blockedUsers(((Number) row[2]).longValue())
                .verifiedUsers(((Number) row[3]).longValue())
                .build();
    }
}

