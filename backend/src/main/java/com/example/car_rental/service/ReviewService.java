package com.example.car_rental.service;

import com.example.car_rental.dto.response.AdminReviewDetailResponse;
import com.example.car_rental.dto.response.AdminReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    Page<AdminReviewResponse> getReviews(Short rating, Integer vehicleId, Pageable pageable);

    AdminReviewDetailResponse getReviewDetail(Integer reviewId);

    void deleteReview(Integer reviewId);
}