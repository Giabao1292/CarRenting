package com.example.car_rental.service;

import com.example.car_rental.dto.response.AdminCustomerResponse;
import com.example.car_rental.dto.response.AdminUserDashboardResponse;
import com.example.car_rental.dto.response.TokenResponse;
import com.example.car_rental.dto.response.UserReportResponse;
import com.example.car_rental.model.User;
import org.springframework.data.domain.Page;

public interface UserService {
    public User findByEmail(String username);


    Page<AdminCustomerResponse> getAllCustomers(String keyword, int page, int size);

    void blockCustomer(Integer id);

    void unlockCustomer(Integer id);

    UserReportResponse getUserReport();

    public void saveAvatar(String avatarUrl, String email);
    AdminUserDashboardResponse getUserDashboard();
    public TokenResponse saveUser(String email);
}
