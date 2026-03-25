package com.example.car_rental.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.example.car_rental.dto.request.AdminCreatePromotionRequest;
import com.example.car_rental.dto.request.AdminUpdatePromotionRequest;
import com.example.car_rental.dto.request.PromotionRequestDTO;
import com.example.car_rental.dto.response.AdminPromotionResponse;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.dto.response.promotion.PromotionResponseDTO;
import com.example.car_rental.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@Validated
public class PromotionController {
    private final PromotionService promotionService;

    @GetMapping
    public ResponseData<List<PromotionResponseDTO>> getPromotions(Authentication authentication,
            PromotionRequestDTO time) {
        String userEmail = authentication == null ? null : authentication.getName();
        List<PromotionResponseDTO> promotionResponseDTOS = promotionService.getPromotions(userEmail, time.getStartAt());
        return new ResponseData<>(200, "Get promotions successfully", promotionResponseDTOS);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseData<AdminPromotionResponse> createPromotion(
            @RequestBody @Valid AdminCreatePromotionRequest request) {
        AdminPromotionResponse response = promotionService.createPromotion(request);
        return new ResponseData<>(200, "Create promotion successfully", response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/view")
    public ResponseData<Page<AdminPromotionResponse>> getAllPromotions(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AdminPromotionResponse> response = promotionService.getAllPromotions(keyword, page, size);
        return new ResponseData<>(200, "Get promotions successfully", response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("me/{id}")
    public ResponseData<AdminPromotionResponse> getPromotionById(@PathVariable Integer id) {
        AdminPromotionResponse response = promotionService.getPromotionById(id);
        return new ResponseData<>(200, "Get promotion successfully", response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("update/{id}")
    public ResponseData<AdminPromotionResponse> updatePromotion(
            @PathVariable Integer id,
            @RequestBody @Valid AdminUpdatePromotionRequest request) {
        AdminPromotionResponse response = promotionService.updatePromotion(id, request);
        return new ResponseData<>(200, "Update promotion successfully", response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("delete/{id}")
    public ResponseData<String> deletePromotion(@PathVariable Integer id) {
        promotionService.deletePromotion(id);
        return new ResponseData<>(200, "Delete promotion successfully");
    }
}
