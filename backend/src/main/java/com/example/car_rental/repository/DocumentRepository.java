package com.example.car_rental.repository;

import com.example.car_rental.model.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Integer> {

    Optional<Document> findTopByUserIdAndDocTypeOrderByCreatedAtDesc(Integer userId, String docType);

    @EntityGraph(attributePaths = {"user"})
    @Query("""
        SELECT d
        FROM Document d
        JOIN d.user u
        WHERE (
            LOWER(d.docType) = 'driving_license'
            OR LOWER(d.docType) = 'driving license'
        )
        AND (
            :keyword IS NULL OR :keyword = ''
            OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(d.docNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND (
            :status IS NULL OR :status = ''
            OR LOWER(COALESCE(d.status, 'PENDING')) = LOWER(:status)
        )
        """)
    Page<Document> searchDrivingLicenses(@Param("keyword") String keyword,
                                         @Param("status") String status,
                                         Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query("""
        SELECT d
        FROM Document d
        WHERE d.id = :id
        AND (
            LOWER(d.docType) = 'driving_license'
            OR LOWER(d.docType) = 'driving license'
        )
        """)
    Optional<Document> findDrivingLicenseById(@Param("id") Integer id);
}
