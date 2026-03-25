package com.example.car_rental.service;

import com.example.car_rental.dto.response.UserLicenseProfileResponse;
import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.model.Document;
import com.example.car_rental.model.User;
import com.example.car_rental.repository.DocumentRepository;
import com.example.car_rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProfileLicenseService {

    private static final String DRIVER_LICENSE_FRONT = "DRIVER_LICENSE_FRONT";
    private static final String DRIVER_LICENSE_BACK = "DRIVER_LICENSE_BACK";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_NOT_SUBMITTED = "NOT_SUBMITTED";

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public UserLicenseProfileResponse getMyLicenseProfile(String email) {
        User user = findByEmail(email);
        Document front = findByType(user.getId(), DRIVER_LICENSE_FRONT);
        Document back = findByType(user.getId(), DRIVER_LICENSE_BACK);
        return mapResponse(user, front, back);
    }

    @Transactional
    public UserLicenseProfileResponse submitMyLicenseProfile(
            String email,
            String licenseNumber,
            MultipartFile frontImage,
            MultipartFile backImage) {
        User user = findByEmail(email);

        String normalizedLicenseNumber = normalizeLicenseNumber(licenseNumber);
        if (normalizedLicenseNumber.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập số GPLX.");
        }

        Document front = findByType(user.getId(), DRIVER_LICENSE_FRONT);
        Document back = findByType(user.getId(), DRIVER_LICENSE_BACK);

        if (frontImage == null && front == null) {
            throw new IllegalArgumentException("Vui lòng tải ảnh mặt trước GPLX.");
        }

        if (backImage == null && back == null) {
            throw new IllegalArgumentException("Vui lòng tải ảnh mặt sau GPLX.");
        }

        if (frontImage != null) {
            String frontUrl = cloudinaryService.uploadIdentityDocument(frontImage, DRIVER_LICENSE_FRONT, user.getId());
            front = upsertDocument(front, user, DRIVER_LICENSE_FRONT, normalizedLicenseNumber, frontUrl);
        } else {
            front = touchDocument(front, normalizedLicenseNumber);
        }

        if (backImage != null) {
            String backUrl = cloudinaryService.uploadIdentityDocument(backImage, DRIVER_LICENSE_BACK, user.getId());
            back = upsertDocument(back, user, DRIVER_LICENSE_BACK, normalizedLicenseNumber, backUrl);
        } else {
            back = touchDocument(back, normalizedLicenseNumber);
        }

        return mapResponse(user, front, back);
    }

    private User findByEmail(String email) {
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Document findByType(Integer userId, String docType) {
        return documentRepository.findTopByUserIdAndDocTypeOrderByCreatedAtDesc(userId, docType).orElse(null);
    }

    private String normalizeLicenseNumber(String value) {
        return value == null ? "" : value.trim();
    }

    private Document touchDocument(Document document, String licenseNumber) {
        if (document == null) {
            return null;
        }

        document.setDocNumber(licenseNumber);
        document.setStatus(STATUS_PENDING);
        document.setVerified(false);
        document.setReason(null);
        return documentRepository.save(document);
    }

    private Document upsertDocument(
            Document existing,
            User user,
            String docType,
            String licenseNumber,
            String fileUrl) {
        Document target = existing == null ? new Document() : existing;
        if (target.getCreatedAt() == null) {
            target.setCreatedAt(LocalDateTime.now());
        }

        target.setUser(user);
        target.setDocType(docType);
        target.setDocNumber(licenseNumber);
        target.setFileUrl(fileUrl);
        target.setStatus(STATUS_PENDING);
        target.setVerified(false);
        target.setReason(null);

        return documentRepository.save(target);
    }

    private UserLicenseProfileResponse mapResponse(User user, Document front, Document back) {
        boolean hasFront = front != null && front.getFileUrl() != null && !front.getFileUrl().isBlank();
        boolean hasBack = back != null && back.getFileUrl() != null && !back.getFileUrl().isBlank();

        boolean verified = Boolean.TRUE.equals(front != null ? front.getVerified() : false)
                && Boolean.TRUE.equals(back != null ? back.getVerified() : false);
        LocalDateTime submittedAt = null;
        if (front != null && front.getCreatedAt() != null) {
            submittedAt = front.getCreatedAt();
        }
        if (back != null && back.getCreatedAt() != null
                && (submittedAt == null || back.getCreatedAt().isAfter(submittedAt))) {
            submittedAt = back.getCreatedAt();
        }
        String licenseNumber = "";
        if (front != null && front.getDocNumber() != null && !front.getDocNumber().isBlank()) {
            licenseNumber = front.getDocNumber();
        } else if (back != null && back.getDocNumber() != null) {
            licenseNumber = back.getDocNumber();
        }

        return UserLicenseProfileResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dob(user.getDob())
                .address(user.getAddressText())
                .licenseNumber(licenseNumber)
                .licenseFrontUrl(hasFront ? front.getFileUrl() : null)
                .licenseBackUrl(hasBack ? back.getFileUrl() : null)
                .verificationStatus(user.getDocuments().stream().findFirst().get().getStatus())
                .verified(verified)
                .submittedAt(submittedAt)
                .build();
    }
}
