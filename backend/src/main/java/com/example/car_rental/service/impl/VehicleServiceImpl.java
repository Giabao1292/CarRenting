package com.example.car_rental.service.impl;

import com.example.car_rental.dto.response.FeatureResponseDTO;
import com.example.car_rental.dto.response.ImageResponseDTO;
import com.example.car_rental.dto.response.PageResponse;
import com.example.car_rental.dto.response.ReviewResponseDTO;
import com.example.car_rental.dto.response.car.VehicleDetailDTO;
import com.example.car_rental.dto.response.car.VehicleSummaryDTO;
import com.example.car_rental.dto.response.slot.BusySlotDTO;
import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.model.*;
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

        List<VehicleSummaryDTO> vehicleSummaryDTOList = vehicles.getContent().stream()
                .map(v -> {
                    Location location = v.getDefaultLocation();
                    return VehicleSummaryDTO.builder()
                            .id(v.getId())
                            .name(v.getBrand() + " " + v.getModel() + " " + v.getYear())
                            .location(location.getAddress())
                            .pricePerDay(v.getPricePerDay())
                            .pricePerHour(v.getPricePerHour())
                            .seats(v.getType().getSeating())
                            .transmission(v.getTransmission())
                            .imageUrl(v.getVehicleImages().stream()
                                    .filter(VehicleImage::getIsPrimary)
                                    .map(VehicleImage::getImageUrl)
                                    .findFirst()
                                    .orElse(null))
                            .rating(v.getAvgRating().doubleValue())
                            .build();
                }).collect(Collectors.toList());
        return PageResponse.<VehicleSummaryDTO>builder()
                .totalElements((int) vehicles.getTotalElements())
                .size(vehicles.getSize())
                .number(vehicles.getNumber())
                .totalPages(vehicles.getTotalPages())
                .content(vehicleSummaryDTOList)
                .build();
    }

    @Override
    public VehicleDetailDTO getCarDetail(Integer id) {
        Vehicle v = vehicleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        List<FeatureResponseDTO> features = v.getVehicleFeatures().stream().map(f -> FeatureResponseDTO.builder().icon(f.getIcon()).name(f.getName()).build()).toList();
        List<ReviewResponseDTO> reviews = v.getReviews().stream().map(r -> ReviewResponseDTO.builder()
                .reviewerName(r.getUser().getUsername())
                .rating(r.getRating().intValue())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .avtUrl(r.getUser().getAvatar())
                .build()).toList();
        List<BusySlotDTO> busySlots = v.getAvailabilitySlots().stream().map(b -> BusySlotDTO.builder()
                .start(b.getStartAt())
                .end(b.getEndAt())
                .build()).toList();
        List<ImageResponseDTO> images = v.getVehicleImages().stream().map(i -> ImageResponseDTO.builder()
                .isPrimary(i.getIsPrimary())
                .imageUrl(i.getImageUrl()).build())
                .collect(Collectors.toList());
        VehicleDetailDTO vehicleDetailDTO = VehicleDetailDTO.builder()
                .id(v.getId())
                .name(v.getBrand() + " " + v.getModel() + " " + v.getYear())
                .pricePerDay(v.getPricePerDay())
                .pricePerHour(v.getPricePerHour())
                .seats(v.getType().getSeating())
                .transmission(v.getTransmission())
                .address(v.getDefaultLocation().getAddress() + ", " + v.getDefaultLocation().getCity())
                .features(features)
                .reviews(reviews)
                .busySlots(busySlots)
                .images(images)
                .build();
        return vehicleDetailDTO;
    }

    @Override
    public List<VehicleSummaryDTO> getCarsByOwner(String userEmail) {
        List<Vehicle> vehicles = vehicleRepository.findAllByOwnerUserEmail(userEmail);

        return vehicles.stream().map(v -> VehicleSummaryDTO
                .builder()
                .id(v.getId())
                .name(v.getBrand() + " " + v.getModel())
                .imageUrl(v.getVehicleImages()
                        .stream()
                        .filter(VehicleImage::getIsPrimary)
                        .findFirst()
                        .map(VehicleImage::getImageUrl)
                        .orElse(null))
                .rating(v.getAvgRating().doubleValue())
                .pricePerDay(v.getPricePerDay())
                .status(v.getStatus())
                .build()).collect(Collectors.toList());
    }

    @Override
    public void updateCarStatus(Integer id, String status, String userEmail) {
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        vehicle.setStatus(status);
        vehicleRepository.save(vehicle);
    }
}
