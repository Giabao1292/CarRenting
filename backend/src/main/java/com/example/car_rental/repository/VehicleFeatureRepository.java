package com.example.car_rental.repository;

import com.example.car_rental.model.VehicleFeature;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleFeatureRepository extends JpaRepository<VehicleFeature, Integer> {
}
