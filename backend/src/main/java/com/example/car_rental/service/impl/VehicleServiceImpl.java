package com.example.car_rental.service.impl;

import com.example.car_rental.dto.response.FeatureResponseDTO;
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
import com.example.car_rental.dto.request.AdminRejectCarRequest;
import com.example.car_rental.dto.response.AdminCarDetailResponse;
import com.example.car_rental.dto.response.AdminCarResponse;
import com.example.car_rental.dto.response.AdminCarSummaryResponse;
import com.example.car_rental.model.VehicleImage;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;


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
        List<String> images = v.getVehicleImages().stream().map(VehicleImage::getImageUrl).toList();
        VehicleDetailDTO vehicleDetailDTO = VehicleDetailDTO.builder()
                .id(v.getId())
                .name(v.getBrand() + " " + v.getModel() + " " + v.getYear())
                .originalPricePerDay(v.getPricePerDay())
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


    private BigDecimal calcPrice(BigDecimal price, Promotion promotion) {
        if (promotion == null) return price;
        return price.subtract(
                        price.multiply(promotion.getDiscountValue()
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)))
                .setScale(0, RoundingMode.HALF_UP);
    }
    @Override
    public AdminCarSummaryResponse getAdminCarSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        long totalCars = vehicleRepository.countByIsDeletedFalse();
        long availableCars = vehicleRepository.countByStatusAndIsDeletedFalse("available");
        long rejectedCars = vehicleRepository.countByStatusAndIsDeletedFalse("rejected");
        long unavailableCars = vehicleRepository.countUnavailableCarsToday(startOfDay, endOfDay);

        return AdminCarSummaryResponse.builder()
                .totalCars(totalCars)
                .availableCars(availableCars)
                .rejectedCars(rejectedCars)
                .unavailableCars(unavailableCars)
                .build();
    }

    @Override
    public Page<AdminCarResponse> getAdminAllCars(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return vehicleRepository.findAllCars(keyword, status, pageable)
                .map(this::mapToAdminCarResponse);
    }

    @Override
    public Page<AdminCarResponse> getAdminPendingCars(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return vehicleRepository.findPendingCars(pageable)
                .map(this::mapToAdminCarResponse);
    }

    @Override
    public AdminCarDetailResponse getAdminCarDetail(Integer id) {
        Vehicle vehicle = vehicleRepository.findActiveCarDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));

        return mapToAdminCarDetailResponse(vehicle);
    }

    @Override
    public void adminRemoveCar(Integer id) {
        Vehicle vehicle = vehicleRepository.findActiveCarDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));

        vehicle.setIsDeleted(true);
        vehicle.setRejectionReason(null);
        vehicle.setUpdatedAt(LocalDateTime.now());

        vehicleRepository.save(vehicle);
    }

    @Override
    public void adminApproveCar(Integer id) {
        Vehicle vehicle = vehicleRepository.findActiveCarDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));

        if (!"pending".equalsIgnoreCase(vehicle.getStatus())) {
            throw new IllegalStateException("Only pending cars can be approved");
        }

        vehicle.setStatus("available");
        vehicle.setRejectionReason(null);
        vehicle.setUpdatedAt(LocalDateTime.now());

        vehicleRepository.save(vehicle);
    }

    @Override
    public void adminRejectCar(Integer id, AdminRejectCarRequest request) {
        Vehicle vehicle = vehicleRepository.findActiveCarDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));

        if (!"pending".equalsIgnoreCase(vehicle.getStatus())) {
            throw new IllegalStateException("Only pending cars can be rejected");
        }

        vehicle.setStatus("rejected");
        vehicle.setRejectionReason(request.getReason().trim());
        vehicle.setUpdatedAt(LocalDateTime.now());

        vehicleRepository.save(vehicle);
    }

    private AdminCarResponse mapToAdminCarResponse(Vehicle vehicle) {
        String thumbnail = vehicle.getVehicleImages() == null
                ? null
                : vehicle.getVehicleImages().stream()
                .filter(VehicleImage::getIsPrimary)
                .map(VehicleImage::getImageUrl)
                .findFirst()
                .orElse(null);

        return AdminCarResponse.builder()
                .id(vehicle.getId())
                .thumbnail(thumbnail)
                .licensePlate(vehicle.getLicensePlate())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .pricePerDay(vehicle.getPricePerDay())
                .status(vehicle.getStatus())
                .build();
    }

    private AdminCarDetailResponse mapToAdminCarDetailResponse(Vehicle vehicle) {
        List<String> images = vehicle.getVehicleImages() == null
                ? List.of()
                : vehicle.getVehicleImages().stream()
                .map(VehicleImage::getImageUrl)
                .toList();

        return AdminCarDetailResponse.builder()
                .id(vehicle.getId())
                .licensePlate(vehicle.getLicensePlate())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .color(vehicle.getColor())
                .pricePerDay(vehicle.getPricePerDay())
                .status(vehicle.getStatus())
                .rejectionReason(vehicle.getRejectionReason())
                .ownerId(vehicle.getOwnerUser() != null ? vehicle.getOwnerUser().getId() : null)
                .ownerName(vehicle.getOwnerUser() != null ? vehicle.getOwnerUser().getFullName() : null)
                .ownerEmail(vehicle.getOwnerUser() != null ? vehicle.getOwnerUser().getEmail() : null)
                .vehicleTypeId(vehicle.getType() != null ? vehicle.getType().getId() : null)
                .vehicleTypeName(vehicle.getType() != null ? vehicle.getType().getName() : null)
                .locationId(vehicle.getDefaultLocation() != null ? vehicle.getDefaultLocation().getId() : null)
                .locationName(vehicle.getDefaultLocation() != null ? vehicle.getDefaultLocation().getName() : null)
                .locationAddress(vehicle.getDefaultLocation() != null ? vehicle.getDefaultLocation().getAddress() : null)
                .images(images)
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
