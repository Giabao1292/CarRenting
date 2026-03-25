package com.example.car_rental.repository;

import com.example.car_rental.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
        @EntityGraph(attributePaths = {
                        "type",
                        "defaultLocation"
        })
        @Query("SELECT v FROM Vehicle v WHERE v.isDeleted = false AND v.status = 'available'")
        Page<Vehicle> findAllAvailable(Pageable pageable);

        @EntityGraph(attributePaths = {
                        "type",
                        "defaultLocation"
        })
        @Query("SELECT v FROM Vehicle v WHERE v.id = :id AND v.isDeleted = false")
        Optional<Vehicle> findById(@Param("id") Integer id);

        List<Vehicle> findAllByOwnerUserEmail(String email);

        boolean existsByLicensePlateIgnoreCase(String licensePlate);

        // admin
        @EntityGraph(attributePaths = { "ownerUser", "type", "defaultLocation", "vehicleImages" })
        @Query("""
                            SELECT v
                            FROM Vehicle v
                            WHERE v.id = :id
                              AND v.isDeleted = false
                        """)
        Optional<Vehicle> findActiveCarDetailById(@Param("id") Integer id);

        @EntityGraph(attributePaths = { "vehicleImages" })
        @Query("""
                            SELECT v
                            FROM Vehicle v
                            WHERE v.isDeleted = false
                              AND (
                                    :keyword IS NULL
                                    OR :keyword = ''
                                    OR LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                    OR LOWER(v.brand) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                    OR LOWER(v.model) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                  )
                              AND (
                                    :status IS NULL
                                    OR :status = ''
                                    OR LOWER(v.status) = LOWER(:status)
                                  )
                        """)
        Page<Vehicle> findAllCars(@Param("keyword") String keyword,
                        @Param("status") String status,
                        Pageable pageable);

        @EntityGraph(attributePaths = { "vehicleImages" })
        @Query("""
                            SELECT v
                            FROM Vehicle v
                            WHERE v.isDeleted = false
                              AND LOWER(v.status) = 'pending'
                        """)
        Page<Vehicle> findPendingCars(Pageable pageable);

        long countByIsDeletedFalse();

        long countByStatusAndIsDeletedFalse(String status);

        @Query("""
                            SELECT COUNT(DISTINCT v.id)
                            FROM Vehicle v
                            WHERE v.isDeleted = false
                              AND EXISTS (
                                  SELECT 1
                                  FROM AvailabilitySlot a
                                  WHERE a.vehicle.id = v.id
                                    AND a.startAt < :endOfDay
                                    AND a.endAt > :startOfDay
                              )
                        """)
        long countUnavailableCarsToday(@Param("startOfDay") LocalDateTime startOfDay,
                        @Param("endOfDay") LocalDateTime endOfDay);

}
