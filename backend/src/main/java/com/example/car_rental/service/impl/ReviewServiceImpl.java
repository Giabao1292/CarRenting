package com.example.car_rental.service.impl;

import com.example.car_rental.dto.request.CreateReviewRequest;
import com.example.car_rental.dto.response.AdminReviewDetailResponse;
import com.example.car_rental.dto.response.AdminReviewResponse;
import com.example.car_rental.model.Booking;
import com.example.car_rental.model.Review;
import com.example.car_rental.model.User;
import com.example.car_rental.model.Vehicle;
import com.example.car_rental.repository.BookingRepository;
import com.example.car_rental.repository.ReviewRepository;
import com.example.car_rental.repository.VehicleRepository;
import com.example.car_rental.service.ReviewService;
import com.example.car_rental.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserService userService;

    @Override
    @Transactional
    public void createReview(String userEmail, CreateReviewRequest request) {
        User user = userService.findByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getUser() == null || booking.getUser().getId() == null
                || !booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền đánh giá chuyến này");
        }

        if (!"completed".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể đánh giá chuyến đã hoàn thành");
        }

        boolean bookingContainsVehicle = booking.getBookingItems().stream()
                .anyMatch(item -> item.getVehicle() != null
                        && request.getVehicleId().equals(item.getVehicle().getId()));

        if (!bookingContainsVehicle) {
            throw new RuntimeException("Xe không thuộc chuyến đã đặt");
        }

        boolean alreadyReviewed = reviewRepository.existsByBookingIdAndUserIdAndVehicleId(
                booking.getId(), user.getId(), request.getVehicleId());
        if (alreadyReviewed) {
            throw new RuntimeException("Bạn đã đánh giá chuyến này rồi");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        Review review = new Review();
        review.setBooking(booking);
        review.setUser(user);
        review.setVehicle(vehicle);
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        review.setCreatedAt(LocalDateTime.now());
        reviewRepository.save(review);

        Double averageRating = reviewRepository.getAverageRatingByVehicleId(vehicle.getId());
        double normalizedAverage = averageRating == null ? 0.0 : averageRating;
        vehicle.setAvgRating(BigDecimal.valueOf(normalizedAverage).setScale(2, RoundingMode.HALF_UP));
        vehicleRepository.save(vehicle);
    }

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