package com.example.car_rental.repository;

import com.example.car_rental.model.OwnerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface OwnerRepository extends JpaRepository<OwnerProfile, Integer> {

    @Query("""
            SELECT op
            FROM OwnerProfile op
            JOIN op.user u
            WHERE (:status IS NULL OR op.verificationStatus = :status)
              AND (
                    :keyword IS NULL
                    OR :keyword = ''
                    OR LOWER(op.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  )
            """)
    @EntityGraph(attributePaths = {"user"})
    Page<OwnerProfile> searchOwners(String keyword, String status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"user"})
    Optional<OwnerProfile> findById(Integer id);

    @EntityGraph(attributePaths = {"user"})
    Optional<OwnerProfile> findByUserId(Integer userId);

    long countByVerificationStatus(String verificationStatus);

    boolean existsByUserId(Integer userId);
}