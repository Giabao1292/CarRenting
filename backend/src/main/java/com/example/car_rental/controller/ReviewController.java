package com.example.car_rental.controller;

import com.example.car_rental.dto.request.CreateReviewRequest;
import com.example.car_rental.dto.response.AdminReviewDetailResponse;
import com.example.car_rental.dto.response.AdminReviewResponse;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseData<String> createReview(
            Authentication authentication,
            @Valid @RequestBody CreateReviewRequest request) {
        reviewService.createReview(authentication.getName(), request);
        return new ResponseData<>(200, "Create review successfully");
    }

    @GetMapping("/admin")
    public ResponseData<Page<AdminReviewResponse>> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Short rating,
            @RequestParam(required = false) Integer vehicleId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AdminReviewResponse> response = reviewService.getReviews(rating, vehicleId, pageable);
        return new ResponseData<>(200, "Get reviews successfully", response);
    }

    @GetMapping("/admin/{id}")
    public ResponseData<AdminReviewDetailResponse> getReviewDetail(@PathVariable Integer id) {
        AdminReviewDetailResponse response = reviewService.getReviewDetail(id);
        return new ResponseData<>(200, "Get review detail successfully", response);
    }

    @DeleteMapping("/admin/{id}")
    public ResponseData<String> deleteReview(@PathVariable Integer id) {
        reviewService.deleteReview(id);
        return new ResponseData<>(200, "Delete review successfully");
    }
}