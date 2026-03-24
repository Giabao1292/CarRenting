package com.example.car_rental.service.impl;

import com.example.car_rental.dto.response.AdminReviewDetailResponse;
import com.example.car_rental.dto.response.AdminReviewResponse;
import com.example.car_rental.model.Review;
import com.example.car_rental.repository.ReviewRepository;
import com.example.car_rental.service.ReviewService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public Page<AdminReviewResponse> getReviews(Short rating, Integer vehicleId, Pageable pageable) {
        return reviewRepository.searchReviews(rating, vehicleId, pageable)
                .map(this::mapToReviewResponse);
    }

    @Override
    public AdminReviewDetailResponse getReviewDetail(Integer reviewId) {
        Review review = reviewRepository.findDetailById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        return mapToReviewDetailResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        reviewRepository.delete(review);
    }

    private AdminReviewResponse mapToReviewResponse(Review review) {
        String vehicleName = null;

        if (review.getVehicle() != null) {
            String brand = review.getVehicle().getBrand() == null ? "" : review.getVehicle().getBrand();
            String model = review.getVehicle().getModel() == null ? "" : review.getVehicle().getModel();
            vehicleName = (brand + " " + model).trim();
        }

        return AdminReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getFullName() : null)
                .userEmail(review.getUser() != null ? review.getUser().getEmail() : null)
                .vehicleId(review.getVehicle() != null ? review.getVehicle().getId() : null)
                .vehicleName(vehicleName)
                .build();
    }

    private AdminReviewDetailResponse mapToReviewDetailResponse(Review review) {
        return AdminReviewDetailResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .bookingId(review.getBooking() != null ? review.getBooking().getId() : null)
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getFullName() : null)
                .userEmail(review.getUser() != null ? review.getUser().getEmail() : null)
                .userPhone(review.getUser() != null ? review.getUser().getPhone() : null)
                .vehicleId(review.getVehicle() != null ? review.getVehicle().getId() : null)
                .vehicleBrand(review.getVehicle() != null ? review.getVehicle().getBrand() : null)
                .vehicleModel(review.getVehicle() != null ? review.getVehicle().getModel() : null)
                .licensePlate(review.getVehicle() != null ? review.getVehicle().getLicensePlate() : null)
                .build();
    }
}