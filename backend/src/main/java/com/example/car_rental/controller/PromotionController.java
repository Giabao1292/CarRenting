package com.example.car_rental.controller;

import com.example.car_rental.dto.request.PromotionRequestDTO;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.dto.response.promotion.PromotionResponseDTO;
import com.example.car_rental.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@Validated
public class PromotionController {
    private final PromotionService promotionService;
    @GetMapping
    public ResponseData<List<PromotionResponseDTO>> getPromotions(Authentication authentication, PromotionRequestDTO time){
        String userEmail = authentication == null ? null : authentication.getName();
        List<PromotionResponseDTO> promotionResponseDTOS = promotionService.getPromotions(userEmail, time.getStartAt());
        return new ResponseData<>(200, "Get promotions successfully", promotionResponseDTOS);
    }
}
