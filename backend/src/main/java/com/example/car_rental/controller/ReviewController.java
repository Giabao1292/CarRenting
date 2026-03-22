package com.example.car_rental.controller;

import com.example.car_rental.dto.response.AdminReviewDetailResponse;
import com.example.car_rental.dto.response.AdminReviewResponse;
import com.example.car_rental.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/admin")
    public Page<AdminReviewResponse> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Short rating,
            @RequestParam(required = false) Integer vehicleId
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewService.getReviews(rating, vehicleId, pageable);
    }

    @GetMapping("/admin/{id}")
    public AdminReviewDetailResponse getReviewDetail(@PathVariable Integer id) {
        return reviewService.getReviewDetail(id);
    }

    @DeleteMapping("/admin/{id}")
    public String deleteReview(@PathVariable Integer id) {
        reviewService.deleteReview(id);
        return "Delete review successfully";
    }
}