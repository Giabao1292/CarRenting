package com.example.car_rental.repository;

import com.example.car_rental.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    @EntityGraph(attributePaths = {
            "type",
            "defaultLocation"
    })
    @Query("SELECT v FROM Vehicle v WHERE v.isDeleted = false AND v.status = 'available'")
    Page<Vehicle> findAllAvailable(Pageable pageable);

}
