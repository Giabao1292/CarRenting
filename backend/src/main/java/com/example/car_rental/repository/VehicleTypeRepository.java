package com.example.car_rental.repository;

import com.example.car_rental.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleTypeRepository extends JpaRepository<VehicleType, Integer> {
    Optional<VehicleType> findFirstBySeatingOrderByIdAsc(Integer seating);

    Optional<VehicleType> findFirstByOrderByIdAsc();
}
