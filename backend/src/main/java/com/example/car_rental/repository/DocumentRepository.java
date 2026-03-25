package com.example.car_rental.repository;

import com.example.car_rental.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Integer> {
    Optional<Document> findTopByUserIdAndDocTypeOrderByCreatedAtDesc(Integer userId, String docType);
}
