package com.example.car_rental.repository;

import com.example.car_rental.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;


public interface SearchCriteriaRepository {

    Page<Vehicle> searchVehicles(Pageable pageable, LocalDateTime pickupAt, LocalDateTime dropoffAt, String... search);
}
