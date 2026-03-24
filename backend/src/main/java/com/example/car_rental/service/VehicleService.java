package com.example.car_rental.service;

import com.example.car_rental.dto.response.PageResponse;
import com.example.car_rental.dto.response.car.VehicleDetailDTO;
import com.example.car_rental.dto.response.car.VehicleSummaryDTO;

import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

public interface VehicleService {

    PageResponse<VehicleSummaryDTO> getCars(Pageable pageable, String userEmail, String... search);

    VehicleDetailDTO getCarDetail(Integer id);
}
