package com.example.car_rental.service;

import com.example.car_rental.dto.request.AdminRejectCarRequest;
import com.example.car_rental.dto.response.AdminLicenseDetailResponse;
import com.example.car_rental.dto.response.AdminLicenseResponse;
import org.springframework.data.domain.Page;

public interface DocumentService {

    Page<AdminLicenseResponse> getAllDrivingLicenses(String keyword, String status, int page, int size);

    AdminLicenseDetailResponse getDrivingLicenseDetail(Integer id);

    AdminLicenseDetailResponse approveDrivingLicense(Integer id);

    AdminLicenseDetailResponse rejectDrivingLicense(Integer id, AdminRejectCarRequest request);
}