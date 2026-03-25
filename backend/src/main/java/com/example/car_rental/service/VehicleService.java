package com.example.car_rental.service;

import com.example.car_rental.dto.request.AdminRejectCarRequest;
import com.example.car_rental.dto.response.AdminCarDetailResponse;
import com.example.car_rental.dto.response.AdminCarResponse;
import com.example.car_rental.dto.response.AdminCarSummaryResponse;
import com.example.car_rental.dto.response.PageResponse;
import com.example.car_rental.dto.response.car.VehicleDetailDTO;
import com.example.car_rental.dto.response.car.VehicleSummaryDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface VehicleService {

    PageResponse<VehicleSummaryDTO> getCars(Pageable pageable, String userEmail, String... search);

    VehicleDetailDTO getCarDetail(Integer id);


    List<VehicleSummaryDTO> getCarsByOwner(String userEmail);

    void updateCarStatus(Integer id, String status, String userEmail);

    AdminCarSummaryResponse getAdminCarSummary();

    Page<AdminCarResponse> getAdminAllCars(String keyword, String status, int page, int size);

    Page<AdminCarResponse> getAdminPendingCars(int page, int size);

    AdminCarDetailResponse getAdminCarDetail(Integer id);

    void adminRemoveCar(Integer id);

    void adminApproveCar(Integer id);

    void adminRejectCar(Integer id, AdminRejectCarRequest request);

}
