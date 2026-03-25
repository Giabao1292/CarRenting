package com.example.car_rental.repository;

import com.example.car_rental.model.VehicleImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleImageRepository extends JpaRepository<VehicleImage, Integer> {
    List<VehicleImage> findAllByVehicleIdOrderByCreatedAtAsc(Integer vehicleId);

    Optional<VehicleImage> findByIdAndVehicleId(Integer id, Integer vehicleId);
}
