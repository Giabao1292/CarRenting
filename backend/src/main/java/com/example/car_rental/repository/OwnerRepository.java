package com.example.car_rental.repository;

import com.example.car_rental.model.OwnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerRepository extends JpaRepository<OwnerProfile, Integer> {
}
