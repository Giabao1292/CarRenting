package com.example.car_rental.service;

import com.example.car_rental.dto.response.promotion.PromotionResponseDTO;
import com.example.car_rental.model.Promotion;
import com.example.car_rental.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.example.car_rental.dto.request.AdminCreatePromotionRequest;
import com.example.car_rental.dto.request.AdminUpdatePromotionRequest;
import com.example.car_rental.dto.response.AdminPromotionResponse;
import com.example.car_rental.model.Promotion;
import com.example.car_rental.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private static final String PERCENT = "PERCENT";
    private static final String FIXED = "FIXED";
    private final PromotionRepository promotionRepository;

    public List<PromotionResponseDTO> getPromotions(String userEmail, LocalDateTime startAt) {
        List<Promotion> promotions = promotionRepository.findPromotionsByUserEmail(userEmail, startAt == null ? LocalDateTime.now() : startAt);
        return promotions.stream().map(p -> PromotionResponseDTO.builder()
                .id(p.getId())
                .code(p.getCode())
                .discountValue(p.getDiscountValue())
                .startAt(p.getStartAt())
                .endAt(p.getEndAt())
                .usageLimit(p.getUsageLimit())
                .build()).collect(Collectors.toList());
    }
    // ================= CREATE =================
    public AdminPromotionResponse createPromotion(AdminCreatePromotionRequest request) {
        validatePromotionRequest(
                request.getCode(),
                request.getDiscountType(),
                request.getDiscountValue(),
                request.getStartAt(),
                request.getEndAt(),
                request.getUsageLimit(),
                null
        );

        if (promotionRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new IllegalArgumentException("Promotion code already exists");
        }

        Promotion promotion = new Promotion();
        promotion.setCode(request.getCode().trim().toUpperCase());
        promotion.setDiscountType(request.getDiscountType().trim().toUpperCase());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setStartAt(request.getStartAt());
        promotion.setEndAt(request.getEndAt());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setCreatedAt(LocalDateTime.now());

        Promotion saved = promotionRepository.save(promotion);
        return mapToResponse(saved);
    }

    // ================= GET ALL =================
    public Page<AdminPromotionResponse> getAllPromotions(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Promotion> promotions = promotionRepository.findByCodeContainingIgnoreCase(
                keyword == null ? "" : keyword.trim(),
                pageable
        );

        return promotions.map(this::mapToResponse);
    }

    // ================= GET DETAIL =================
    public AdminPromotionResponse getPromotionById(Integer id) {
        Promotion promotion = findPromotionById(id);
        return mapToResponse(promotion);
    }

    // ================= UPDATE =================
    public AdminPromotionResponse updatePromotion(Integer id, AdminUpdatePromotionRequest request) {
        Promotion promotion = findPromotionById(id);

        validatePromotionRequest(
                request.getCode(),
                request.getDiscountType(),
                request.getDiscountValue(),
                request.getStartAt(),
                request.getEndAt(),
                request.getUsageLimit(),
                id
        );

        if (promotionRepository.existsByCodeAndIdNot(request.getCode().trim().toUpperCase(), id)) {
            throw new IllegalArgumentException("Promotion code already exists");
        }

        promotion.setCode(request.getCode().trim().toUpperCase());
        promotion.setDiscountType(request.getDiscountType().trim().toUpperCase());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setStartAt(request.getStartAt());
        promotion.setEndAt(request.getEndAt());
        promotion.setUsageLimit(request.getUsageLimit());

        Promotion updated = promotionRepository.save(promotion);
        return mapToResponse(updated);
    }

    // ================= DELETE =================
    public void deletePromotion(Integer id) {
        Promotion promotion = findPromotionById(id);
        promotionRepository.delete(promotion);
    }

    // ================= HELPER =================
    private Promotion findPromotionById(Integer id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found"));
    }

    private void validatePromotionRequest(String code,
                                          String discountType,
                                          BigDecimal discountValue,
                                          LocalDateTime startAt,
                                          LocalDateTime endAt,
                                          Integer usageLimit,
                                          Integer id) {

        String normalizedCode = code.trim().toUpperCase();
        String normalizedType = discountType.trim().toUpperCase();

        // check type
        if (!normalizedType.equals(PERCENT) && !normalizedType.equals(FIXED)) {
            throw new IllegalArgumentException("Discount type must be PERCENT or FIXED");
        }

        // check date
        if (startAt != null && endAt != null && !startAt.isBefore(endAt)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // check usage
        if (usageLimit != null && usageLimit <= 0) {
            throw new IllegalArgumentException("Usage limit must be greater than 0");
        }

        // check percent
        if (normalizedType.equals(PERCENT) && discountValue.compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Percent must be <= 100");
        }

        // check code
        if (normalizedCode.isBlank()) {
            throw new IllegalArgumentException("Code must not be blank");
        }
    }

    private AdminPromotionResponse mapToResponse(Promotion p) {
        return AdminPromotionResponse.builder()
                .id(p.getId())
                .code(p.getCode())
                .discountType(p.getDiscountType())
                .discountValue(p.getDiscountValue())
                .startAt(p.getStartAt())
                .endAt(p.getEndAt())
                .usageLimit(p.getUsageLimit())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
