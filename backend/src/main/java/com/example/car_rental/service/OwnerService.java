package com.example.car_rental.service;

import com.example.car_rental.dto.request.AdminRejectOwnerRequest;
import com.example.car_rental.dto.request.OwnerRegisterDTO;
import com.example.car_rental.dto.response.AdminOwnerDetailResponse;
import com.example.car_rental.dto.response.AdminOwnerResponse;
import com.example.car_rental.dto.response.AdminOwnerSummaryResponse;
import com.example.car_rental.dto.request.TimeOwnerRequestDTO;
import com.example.car_rental.dto.response.TimeOwnerResponseDTO;
import com.example.car_rental.model.OwnerProfile;
import com.example.car_rental.model.User;
import com.example.car_rental.repository.OwnerRepository;
import com.example.car_rental.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class OwnerService {
    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private final OwnerRepository ownerRepository;
    private final UserRepository userRepository;

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String ROLE_OWNER = "owner";

    public OwnerService(UserService userService, CloudinaryService cloudinaryService, OwnerRepository ownerRepository, UserRepository userRepository) {
        this.userService = userService;
        this.cloudinaryService = cloudinaryService;
        this.ownerRepository = ownerRepository;
        this.userRepository = userRepository;
    }

    public void registerOwner(OwnerRegisterDTO ownerRegisterDTO, MultipartFile idCardFront, MultipartFile idCardBack, String userEmail) {
        User user = userService.findByEmail(userEmail);

        OwnerProfile ownerProfile = new OwnerProfile();
        ownerProfile.setUser(user);
        ownerProfile.setOwnerType(ownerRegisterDTO.getOwnerType());
        ownerProfile.setResidencyType(ownerRegisterDTO.getResidencyType());
        ownerProfile.setFullName(ownerRegisterDTO.getFullName());
        ownerProfile.setCity(ownerRegisterDTO.getCity());
        ownerProfile.setAddress(ownerRegisterDTO.getAddress());
        ownerProfile.setIdNumber(ownerRegisterDTO.getIdNumber());

        ownerProfile.setIdCardFrontUrl(cloudinaryService.uploadIdentityDocument(idCardFront, "CCCD_FRONT", user.getId()));
        ownerProfile.setIdCardBackUrl(cloudinaryService.uploadIdentityDocument(idCardBack, "CCCD_BACK", user.getId()));
        ownerProfile.setOpenTime(LocalTime.of(7, 0));
        ownerProfile.setCloseTime(LocalTime.of(20, 0));
        ownerProfile.setCreatedAt(LocalDateTime.now());
        ownerProfile.setUpdatedAt(LocalDateTime.now());
        ownerProfile.setVerificationStatus("PENDING");
        ownerRepository.save(ownerProfile);
    }
    public String getStatus(String userEmail) {
        User user = userService.findByEmail(userEmail);
        OwnerProfile ownerProfile = user.getOwnerProfile();
        return ownerProfile.getVerificationStatus();
    }
    public AdminOwnerSummaryResponse getAdminOwnerSummary() {
        return new AdminOwnerSummaryResponse(
                ownerRepository.count(),
                ownerRepository.countByVerificationStatus(STATUS_PENDING),
                ownerRepository.countByVerificationStatus(STATUS_APPROVED),
                ownerRepository.countByVerificationStatus(STATUS_REJECTED)
        );
    }

    public Page<AdminOwnerResponse> getPendingOwners(String keyword, int page, int size) {
        return getOwnersByStatus(keyword, STATUS_PENDING, page, size);
    }

    public Page<AdminOwnerResponse> getApprovedOwners(String keyword, int page, int size) {
        return getOwnersByStatus(keyword, STATUS_APPROVED, page, size);
    }

    public Page<AdminOwnerResponse> getRejectedOwners(String keyword, int page, int size) {
        return getOwnersByStatus(keyword, STATUS_REJECTED, page, size);
    }

    public AdminOwnerDetailResponse getOwnerDetail(Integer id) {
        OwnerProfile ownerProfile = findOwnerProfileById(id);
        User user = ownerProfile.getUser();

        return AdminOwnerDetailResponse.builder()
                .id(ownerProfile.getId())
                .userId(user.getId())
                .fullName(ownerProfile.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .ownerType(ownerProfile.getOwnerType())
                .residencyType(ownerProfile.getResidencyType())
                .city(ownerProfile.getCity())
                .address(ownerProfile.getAddress())
                .idNumber(ownerProfile.getIdNumber())
                .idCardFrontUrl(ownerProfile.getIdCardFrontUrl())
                .idCardBackUrl(ownerProfile.getIdCardBackUrl())
                .verificationStatus(ownerProfile.getVerificationStatus())
                .reviewNote(ownerProfile.getReviewNote())
                .userVerified(user.getVerified())
                .userRole(user.getRole())
                .userDeleted(user.getIsDeleted())
                .createdAt(ownerProfile.getCreatedAt())
                .updatedAt(ownerProfile.getUpdatedAt())
                .build();
    }

    @Transactional
    public void approveOwner(Integer id) {
        OwnerProfile ownerProfile = findOwnerProfileById(id);

        if (STATUS_APPROVED.equals(ownerProfile.getVerificationStatus())) {
            throw new IllegalStateException("Owner profile is already approved");
        }

        User user = ownerProfile.getUser();
        ownerProfile.setVerificationStatus(STATUS_APPROVED);
        ownerProfile.setReviewNote(null);
        ownerProfile.setUpdatedAt(LocalDateTime.now());

        user.setRole(ROLE_OWNER);

        userRepository.save(user);
        ownerRepository.save(ownerProfile);
    }

    @Transactional
    public void rejectOwner(Integer id, AdminRejectOwnerRequest request) {
        OwnerProfile ownerProfile = findOwnerProfileById(id);

        if (STATUS_APPROVED.equals(ownerProfile.getVerificationStatus())) {
            throw new IllegalStateException("Approved owner profile cannot be rejected");
        }

        ownerProfile.setVerificationStatus(STATUS_REJECTED);
        ownerProfile.setReviewNote(request.getReason().trim());
        ownerProfile.setUpdatedAt(LocalDateTime.now());

        ownerRepository.save(ownerProfile);
    }

    private Page<AdminOwnerResponse> getOwnersByStatus(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ownerRepository.searchOwners(normalizeKeyword(keyword), status, pageable)
                .map(this::mapToAdminOwnerResponse);
    }

    private OwnerProfile findOwnerProfileById(Integer id) {
        return ownerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Owner profile not found with id: " + id));
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }
        String trimmed = keyword.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private AdminOwnerResponse mapToAdminOwnerResponse(OwnerProfile ownerProfile) {
        User user = ownerProfile.getUser();

        return AdminOwnerResponse.builder()
                .id(ownerProfile.getId())
                .userId(user.getId())
                .fullName(ownerProfile.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .city(ownerProfile.getCity())
                .ownerType(ownerProfile.getOwnerType())
                .residencyType(ownerProfile.getResidencyType())
                .verificationStatus(ownerProfile.getVerificationStatus())
                .reviewNote(ownerProfile.getReviewNote())
                .createdAt(ownerProfile.getCreatedAt())
                .updatedAt(ownerProfile.getUpdatedAt())
                .build();
    }
    public void updateTime(String userEmail, TimeOwnerRequestDTO timeOwnerRequestDTO) {
        User user = userService.findByEmail(userEmail);
        OwnerProfile ownerProfile = user.getOwnerProfile();
        ownerProfile.setOpenTime(timeOwnerRequestDTO.getOpen());
        ownerProfile.setCloseTime(timeOwnerRequestDTO.getClose());
        ownerProfile.setUpdatedAt(LocalDateTime.now());
        ownerRepository.save(ownerProfile);
    }
    public TimeOwnerResponseDTO getTime(String userEmail) {
        User user = userService.findByEmail(userEmail);
        OwnerProfile ownerProfile = user.getOwnerProfile();
        TimeOwnerResponseDTO timeOwnerResponseDTO = new TimeOwnerResponseDTO();
        timeOwnerResponseDTO.setOpen(ownerProfile.getOpenTime());
        timeOwnerResponseDTO.setClose(ownerProfile.getCloseTime());
        return timeOwnerResponseDTO;

    }
}

