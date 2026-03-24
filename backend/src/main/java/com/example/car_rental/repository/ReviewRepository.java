package com.example.car_rental.repository;

import com.example.car_rental.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    @Query("""
        SELECT r
        FROM Review r
        WHERE (:rating IS NULL OR r.rating = :rating)
          AND (:vehicleId IS NULL OR r.vehicle.id = :vehicleId)
    """)
    Page<Review> searchReviews(
            @Param("rating") Short rating,
            @Param("vehicleId") Integer vehicleId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "vehicle", "booking"})
    @Query("""
        SELECT r
        FROM Review r
        WHERE r.id = :id
    """)
    Optional<Review> findDetailById(@Param("id") Integer id);
}