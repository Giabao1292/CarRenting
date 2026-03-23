package com.example.car_rental.service.impl;

import com.example.car_rental.dto.response.PageResponse;
import com.example.car_rental.dto.response.car.VehicleSummaryDTO;
import com.example.car_rental.model.Location;
import com.example.car_rental.model.Promotion;
import com.example.car_rental.model.Vehicle;
import com.example.car_rental.model.VehicleImage;
import com.example.car_rental.repository.PromotionRepository;
import com.example.car_rental.repository.SearchCriteriaRepository;
import com.example.car_rental.repository.VehicleRepository;
import com.example.car_rental.service.SearchCriteriaService;
import com.example.car_rental.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {
    private final VehicleRepository vehicleRepository;
    private final SearchCriteriaRepository searchCriteriaRepository;
    private final SearchCriteriaService searchCriteriaService;
    private final PromotionRepository promotionRepository;

    @Override
    public PageResponse<VehicleSummaryDTO> getCars(Pageable pageable, String userEmail, String... search) {
        Page<Vehicle> vehicles = Page.empty();
        LocalDateTime pickupAt = searchCriteriaService.extractDateTime("pickupAt", search);
        LocalDateTime dropoffAt = searchCriteriaService.extractDateTime("dropoffAt", search);
        if (search == null || search.length == 0) {
            vehicles = vehicleRepository.findAllAvailable(pageable);
        } else {
            List<String> searchList = Arrays.stream(search)
                    .filter(s -> !s.startsWith("pickupAt:") && !s.startsWith("dropoffAt:"))
                    .collect(Collectors.toCollection(ArrayList::new));
            searchList.add("isDeleted:false");
            searchList.add("status:available");
            vehicles = searchCriteriaRepository.searchVehicles(pageable, pickupAt, dropoffAt, searchList.toArray(new String[0]));
        }

        Promotion promotion = promotionRepository.findBestPromotion(userEmail, pickupAt == null ? LocalDateTime.now() : pickupAt).orElse(null);
        List<VehicleSummaryDTO> vehicleSummaryDTOList = vehicles.getContent().stream()
                .map(v -> {
                    Location location = v.getDefaultLocation();
                    return VehicleSummaryDTO.builder()
                            .id(v.getId())
                            .name(v.getBrand() + " " + v.getModel() + " " + v.getYear())
                            .location(location.getAddress())
                            .pricePerDay(calcPrice(v.getPricePerDay(), promotion))
                            .originalPricePerDay(v.getPricePerDay())
                            .discountPercent(promotion == null ? 0 : promotion.getDiscountValue().intValue())
                            .seats(v.getType().getSeating())
                            .transmission(v.getTransmission())
                            .imageUrl(v.getVehicleImages().stream()
                                    .filter(VehicleImage::getIsPrimary)
                                    .map(VehicleImage::getImageUrl)
                                    .findFirst()
                                    .orElse(null))
                            .rating(v.getAvgRating().doubleValue())
                            .build();
                }).toList();
        return PageResponse.<VehicleSummaryDTO>builder()
                .totalElements((int) vehicles.getTotalElements())
                .size(vehicles.getSize())
                .number(vehicles.getNumber())
                .totalPages(vehicles.getTotalPages())
                .content(vehicleSummaryDTOList)
                .build();
    }

    private BigDecimal calcPrice(BigDecimal price, Promotion promotion) {
        if (promotion == null) return price;
        return price.subtract(
                        price.multiply(promotion.getDiscountValue()
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)))
                .setScale(0, RoundingMode.HALF_UP);
    }
}
