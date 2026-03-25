package com.example.car_rental.service.impl;

import com.example.car_rental.dto.request.AdminRejectCarRequest;
import com.example.car_rental.dto.request.OwnerCreateVehicleRequest;
import com.example.car_rental.dto.request.OwnerUpdateVehicleRequest;
import com.example.car_rental.dto.response.AdminCarDetailResponse;
import com.example.car_rental.dto.response.AdminCarResponse;
import com.example.car_rental.dto.response.AdminCarSummaryResponse;
import com.example.car_rental.dto.response.FeatureResponseDTO;
import com.example.car_rental.dto.response.ImageResponseDTO;
import com.example.car_rental.dto.response.OwnerVehicleImageResponse;
import com.example.car_rental.dto.response.OwnerVehicleManageResponse;
import com.example.car_rental.dto.response.PageResponse;
import com.example.car_rental.dto.response.ReviewResponseDTO;
import com.example.car_rental.dto.response.car.VehicleDetailDTO;
import com.example.car_rental.dto.response.car.VehicleSummaryDTO;
import com.example.car_rental.dto.response.slot.BusySlotDTO;
import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.model.*;
import com.example.car_rental.repository.LocationRepository;
import com.example.car_rental.repository.SearchCriteriaRepository;
import com.example.car_rental.repository.UserRepository;
import com.example.car_rental.repository.VehicleFeatureRepository;
import com.example.car_rental.repository.VehicleImageRepository;
import com.example.car_rental.repository.VehicleRepository;
import com.example.car_rental.repository.VehicleTypeRepository;
import com.example.car_rental.service.CloudinaryService;
import com.example.car_rental.service.SearchCriteriaService;
import com.example.car_rental.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.time.Instant;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {
        private final VehicleRepository vehicleRepository;
        private final UserRepository userRepository;
        private final VehicleTypeRepository vehicleTypeRepository;
        private final LocationRepository locationRepository;
        private final VehicleFeatureRepository vehicleFeatureRepository;
        private final VehicleImageRepository vehicleImageRepository;
        private final CloudinaryService cloudinaryService;
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
                        vehicles = searchCriteriaRepository.searchVehicles(pageable, pickupAt, dropoffAt,
                                        searchList.toArray(new String[0]));
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
                Vehicle v = vehicleRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
                List<FeatureResponseDTO> features = v.getVehicleFeatures().stream()
                                .map(f -> FeatureResponseDTO.builder().icon(f.getIcon()).name(f.getName()).build())
                                .toList();
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
        public List<FeatureResponseDTO> getVehicleFeatures() {
                return vehicleFeatureRepository.findAll().stream()
                                .map(feature -> FeatureResponseDTO.builder()
                                                .id(feature.getId())
                                                .name(feature.getName())
                                                .icon(feature.getIcon())
                                                .build())
                                .toList();
        }

        @Override
        public OwnerVehicleManageResponse createOwnerVehicle(OwnerCreateVehicleRequest request, String userEmail) {
                if (request == null) {
                        throw new IllegalArgumentException("Request body is required");
                }

                String licensePlate = normalizeRequired(request.getLicensePlate(), "License plate is required");
                if (vehicleRepository.existsByLicensePlateIgnoreCase(licensePlate)) {
                        throw new IllegalArgumentException("License plate already exists");
                }

                User owner = userRepository.findUserByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Integer seating = request.getSeating() == null ? 4 : request.getSeating();
                VehicleType vehicleType = vehicleTypeRepository.findFirstBySeatingOrderByIdAsc(seating)
                                .or(() -> vehicleTypeRepository.findFirstByOrderByIdAsc())
                                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found"));

                Location location = new Location();
                String locationAddress = normalizeRequired(request.getLocationAddress(),
                                "Location address is required");
                location.setAddress(locationAddress);
                location.setCity(normalizeOptional(request.getLocationCity()));
                location.setCountry("Vietnam");
                location.setName("Điểm nhận xe " + licensePlate);
                location.setCreatedAt(Instant.now());
                location.setUpdatedAt(Instant.now());
                Location savedLocation = locationRepository.save(location);

                Vehicle vehicle = new Vehicle();
                vehicle.setDefaultLocation(savedLocation);
                vehicle.setType(vehicleType);
                vehicle.setOwnerUser(owner);
                vehicle.setLicensePlate(licensePlate);
                vehicle.setBrand(normalizeRequired(request.getBrand(), "Brand is required"));
                vehicle.setModel(normalizeRequired(request.getModel(), "Model is required"));
                vehicle.setYear(request.getYear());
                vehicle.setColor(normalizeOptional(request.getColor()));
                vehicle.setTransmission(normalizeTransmission(request.getTransmission()));
                vehicle.setPricePerDay(request.getPricePerDay());
                vehicle.setPricePerHour(request.getPricePerHour());
                vehicle.setStatus("pending");
                vehicle.setAvgRating(java.math.BigDecimal.ZERO);
                vehicle.setIsDeleted(false);
                vehicle.setCreatedAt(LocalDateTime.now());
                vehicle.setUpdatedAt(LocalDateTime.now());

                List<Integer> featureIds = request.getFeatureIds() == null ? List.of() : request.getFeatureIds();
                if (!featureIds.isEmpty()) {
                        List<VehicleFeature> features = vehicleFeatureRepository.findAllById(featureIds);
                        vehicle.getVehicleFeatures().addAll(features);
                }

                Vehicle savedVehicle = vehicleRepository.save(vehicle);
                return mapOwnerVehicleManageResponse(savedVehicle);
        }

        @Override
        public OwnerVehicleManageResponse getOwnerVehicleManageDetail(Integer id, String userEmail) {
                Vehicle vehicle = findOwnedVehicle(id, userEmail);
                return mapOwnerVehicleManageResponse(vehicle);
        }

        @Override
        public OwnerVehicleManageResponse updateOwnerVehicle(Integer id,
                        OwnerUpdateVehicleRequest request, String userEmail) {
                Vehicle vehicle = findOwnedVehicle(id, userEmail);

                boolean changed = false;

                if (request.getLicensePlate() != null) {
                        String nextValue = request.getLicensePlate().trim();
                        if (!nextValue.equals(vehicle.getLicensePlate())) {
                                vehicle.setLicensePlate(nextValue);
                                changed = true;
                        }
                }

                if (request.getBrand() != null) {
                        String nextValue = request.getBrand().trim();
                        if (!nextValue.equals(vehicle.getBrand())) {
                                vehicle.setBrand(nextValue);
                                changed = true;
                        }
                }

                if (request.getModel() != null) {
                        String nextValue = request.getModel().trim();
                        if (!nextValue.equals(vehicle.getModel())) {
                                vehicle.setModel(nextValue);
                                changed = true;
                        }
                }

                if (request.getYear() != null && !request.getYear().equals(vehicle.getYear())) {
                        vehicle.setYear(request.getYear());
                        changed = true;
                }

                if (request.getColor() != null) {
                        String nextValue = request.getColor().trim();
                        if (!nextValue.equals(vehicle.getColor())) {
                                vehicle.setColor(nextValue);
                                changed = true;
                        }
                }

                if (request.getTransmission() != null) {
                        String nextValue = request.getTransmission().trim();
                        if (!nextValue.equalsIgnoreCase(String.valueOf(vehicle.getTransmission()))) {
                                vehicle.setTransmission(nextValue);
                                changed = true;
                        }
                }

                if (request.getPricePerDay() != null
                                && (vehicle.getPricePerDay() == null
                                                || request.getPricePerDay().compareTo(vehicle.getPricePerDay()) != 0)) {
                        vehicle.setPricePerDay(request.getPricePerDay());
                        changed = true;
                }

                if (request.getPricePerHour() != null
                                && (vehicle.getPricePerHour() == null || request.getPricePerHour()
                                                .compareTo(vehicle.getPricePerHour()) != 0)) {
                        vehicle.setPricePerHour(request.getPricePerHour());
                        changed = true;
                }

                if (changed) {
                        vehicle.setStatus("pending");
                        vehicle.setUpdatedAt(LocalDateTime.now());
                        vehicleRepository.save(vehicle);
                }

                return mapOwnerVehicleManageResponse(vehicle);
        }

        @Override
        public OwnerVehicleManageResponse uploadOwnerVehicleImage(Integer id, MultipartFile file, Boolean isPrimary,
                        String userEmail) {
                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException("Image file is required");
                }

                Vehicle vehicle = findOwnedVehicle(id, userEmail);
                String secureUrl = cloudinaryService.uploadVehicleImage(file, vehicle.getId());
                boolean hasAnyImage = !vehicleImageRepository.findAllByVehicleIdOrderByCreatedAtAsc(vehicle.getId())
                                .isEmpty();

                if (Boolean.TRUE.equals(isPrimary)) {
                        clearPrimaryImages(vehicle.getId());
                }

                VehicleImage image = new VehicleImage();
                image.setVehicle(vehicle);
                image.setImageUrl(secureUrl);
                image.setCreatedAt(Instant.now());
                image.setIsPrimary(Boolean.TRUE.equals(isPrimary) || !hasAnyImage);

                vehicleImageRepository.save(image);

                vehicle.setStatus("pending");
                vehicle.setUpdatedAt(LocalDateTime.now());
                vehicleRepository.save(vehicle);

                return mapOwnerVehicleManageResponse(vehicle);
        }

        private String normalizeRequired(String value, String errorMessage) {
                String normalized = normalizeOptional(value);
                if (normalized == null) {
                        throw new IllegalArgumentException(errorMessage);
                }
                return normalized;
        }

        private String normalizeOptional(String value) {
                if (value == null) {
                        return null;
                }

                String normalized = value.trim();
                return normalized.isEmpty() ? null : normalized;
        }

        private String normalizeTransmission(String value) {
                String normalized = normalizeOptional(value);
                if (normalized == null) {
                        return "automatic";
                }

                String lower = normalized.toLowerCase(Locale.ROOT);
                if (!lower.equals("automatic") && !lower.equals("manual")) {
                        return "automatic";
                }

                return lower;
        }

        @Override
        public OwnerVehicleManageResponse deleteOwnerVehicleImage(Integer id, Integer imageId, String userEmail) {
                Vehicle vehicle = findOwnedVehicle(id, userEmail);
                VehicleImage image = vehicleImageRepository.findByIdAndVehicleId(imageId, vehicle.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Vehicle image not found"));

                boolean deletedPrimary = Boolean.TRUE.equals(image.getIsPrimary());

                vehicleImageRepository.delete(image);

                if (deletedPrimary) {
                        vehicleImageRepository.findAllByVehicleIdOrderByCreatedAtAsc(vehicle.getId()).stream()
                                        .findFirst().ifPresent(nextImage -> {
                                                nextImage.setIsPrimary(true);
                                                vehicleImageRepository.save(nextImage);
                                        });
                }

                vehicle.setStatus("pending");
                vehicle.setUpdatedAt(LocalDateTime.now());
                vehicleRepository.save(vehicle);

                return mapOwnerVehicleManageResponse(vehicle);
        }

        @Override
        public void updateCarStatus(Integer id, String status, String userEmail) {
                Vehicle vehicle = vehicleRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
                vehicle.setStatus(status);
                vehicleRepository.save(vehicle);
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

                vehicle.setStatus("inactive");
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
                                .locationId(vehicle.getDefaultLocation() != null ? vehicle.getDefaultLocation().getId()
                                                : null)
                                .locationName(vehicle.getDefaultLocation() != null
                                                ? vehicle.getDefaultLocation().getName()
                                                : null)
                                .locationAddress(vehicle.getDefaultLocation() != null
                                                ? vehicle.getDefaultLocation().getAddress()
                                                : null)
                                .images(images)
                                .createdAt(vehicle.getCreatedAt())
                                .updatedAt(vehicle.getUpdatedAt())
                                .build();
        }

        private Vehicle findOwnedVehicle(Integer vehicleId, String userEmail) {
                if (userEmail == null || userEmail.isBlank()) {
                        throw new RuntimeException("Unauthorized");
                }

                Vehicle vehicle = vehicleRepository.findById(vehicleId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Vehicle not found with id: " + vehicleId));

                if (vehicle.getOwnerUser() == null || vehicle.getOwnerUser().getEmail() == null
                                || !vehicle.getOwnerUser().getEmail().equalsIgnoreCase(userEmail)) {
                        throw new RuntimeException("You are not allowed to manage this vehicle");
                }

                return vehicle;
        }

        private void clearPrimaryImages(Integer vehicleId) {
                List<VehicleImage> images = vehicleImageRepository.findAllByVehicleIdOrderByCreatedAtAsc(vehicleId);
                images.forEach(image -> image.setIsPrimary(false));
                vehicleImageRepository.saveAll(images);
        }

        private OwnerVehicleManageResponse mapOwnerVehicleManageResponse(Vehicle vehicle) {
                List<OwnerVehicleImageResponse> images = vehicleImageRepository
                                .findAllByVehicleIdOrderByCreatedAtAsc(vehicle.getId())
                                .stream()
                                .sorted(Comparator.comparing(VehicleImage::getIsPrimary).reversed())
                                .map(image -> OwnerVehicleImageResponse.builder()
                                                .id(image.getId())
                                                .imageUrl(image.getImageUrl())
                                                .isPrimary(image.getIsPrimary())
                                                .build())
                                .toList();

                return OwnerVehicleManageResponse.builder()
                                .id(vehicle.getId())
                                .status(vehicle.getStatus())
                                .rejectionReason(vehicle.getRejectionReason())
                                .licensePlate(vehicle.getLicensePlate())
                                .brand(vehicle.getBrand())
                                .model(vehicle.getModel())
                                .year(vehicle.getYear())
                                .color(vehicle.getColor())
                                .transmission(vehicle.getTransmission())
                                .pricePerDay(vehicle.getPricePerDay())
                                .pricePerHour(vehicle.getPricePerHour())
                                .locationName(vehicle.getDefaultLocation() != null
                                                ? vehicle.getDefaultLocation().getName()
                                                : null)
                                .locationAddress(vehicle.getDefaultLocation() != null
                                                ? vehicle.getDefaultLocation().getAddress()
                                                : null)
                                .images(images)
                                .build();
        }
}
