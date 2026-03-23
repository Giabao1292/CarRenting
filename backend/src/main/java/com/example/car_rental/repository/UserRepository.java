package com.example.car_rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.car_rental.model.User;

import org.springframework.data.jpa.repository.Query;

import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    @Query("""
        SELECT u
        FROM User u
        WHERE LOWER(u.role) = 'customer'
          AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
    """)
    Page<User> findAllCustomers(String keyword, Pageable pageable);

    // ===== REPORT =====

    // Growth
    long countByRoleAndCreatedAtAfter(String role, java.time.Instant time);

    // Active
    long countByIsDeletedFalseAndVerifiedTrue();
    long countByRoleAndIsDeletedFalseAndVerifiedTrue(String role);

    // Inactive
    long countByIsDeletedTrueOrVerifiedFalse();
    long countByRoleAndIsDeletedTrueOrVerifiedFalse(String role);
    Optional<User> findUserByEmail(String email);


}
