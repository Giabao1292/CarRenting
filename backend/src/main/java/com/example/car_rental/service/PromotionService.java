package com.example.car_rental.service;

import com.example.car_rental.dto.response.promotion.PromotionResponseDTO;
import com.example.car_rental.model.Promotion;
import com.example.car_rental.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {
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
}
