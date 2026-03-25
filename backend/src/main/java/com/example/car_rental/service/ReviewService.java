package com.example.car_rental.service;

import com.example.car_rental.dto.request.CreateReviewRequest;
import com.example.car_rental.dto.response.AdminReviewDetailResponse;
import com.example.car_rental.dto.response.AdminReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    void createReview(String userEmail, CreateReviewRequest request);

    Page<AdminReviewResponse> getReviews(Short rating, Integer vehicleId, Pageable pageable);

    AdminReviewDetailResponse getReviewDetail(Integer reviewId);

    void deleteReview(Integer reviewId);
}