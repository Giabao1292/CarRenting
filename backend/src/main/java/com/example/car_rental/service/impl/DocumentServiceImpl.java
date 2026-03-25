package com.example.car_rental.service.impl;

import com.example.car_rental.dto.request.AdminRejectCarRequest;
import com.example.car_rental.dto.response.AdminLicenseDetailResponse;
import com.example.car_rental.dto.response.AdminLicenseResponse;
import com.example.car_rental.model.Document;
import com.example.car_rental.repository.DocumentRepository;
import com.example.car_rental.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;

    @Override
    public Page<AdminLicenseResponse> getAllDrivingLicenses(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return documentRepository.searchDrivingLicenses(keyword, status, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public AdminLicenseDetailResponse getDrivingLicenseDetail(Integer id) {
        Document document = getDocumentOrThrow(id);
        return mapToDetailResponse(document);
    }

    @Override
    public AdminLicenseDetailResponse approveDrivingLicense(Integer id) {
        Document document = getDocumentOrThrow(id);

        document.setStatus("APPROVED");
        document.setReason(null);
        document.setVerified(true);

        Document saved = documentRepository.save(document);
        return mapToDetailResponse(saved);
    }

    @Override
    public AdminLicenseDetailResponse rejectDrivingLicense(Integer id, AdminRejectCarRequest request) {
        Document document = getDocumentOrThrow(id);

        document.setStatus("REJECTED");
        document.setReason(request.getReason().trim());
        document.setVerified(false);

        Document saved = documentRepository.save(document);
        return mapToDetailResponse(saved);
    }

    private Document getDocumentOrThrow(Integer id) {
        return documentRepository.findDrivingLicenseById(id)
                .orElseThrow(() -> new RuntimeException("Driving license not found with id: " + id));
    }

    private AdminLicenseResponse mapToResponse(Document d) {
        return new AdminLicenseResponse(
                d.getId(),
                d.getUser().getId(),
                d.getUser().getFullName(),
                d.getUser().getEmail(),
                d.getUser().getPhone(),
                d.getDocType(),
                d.getDocNumber(),
                d.getFileUrl(),
                d.getVerified(),
                d.getExpiryDate(),
                d.getCreatedAt(),
                normalizeStatus(d),
                d.getReason()
        );
    }

    private AdminLicenseDetailResponse mapToDetailResponse(Document d) {
        return new AdminLicenseDetailResponse(
                d.getId(),
                d.getUser().getId(),
                d.getUser().getFullName(),
                d.getUser().getEmail(),
                d.getUser().getPhone(),
                d.getUser().getAddressText(),
                d.getDocType(),
                d.getDocNumber(),
                d.getFileUrl(),
                d.getVerified(),
                d.getExpiryDate(),
                d.getCreatedAt(),
                normalizeStatus(d),
                d.getReason()
        );
    }

    private String normalizeStatus(Document d) {
        if (d.getStatus() != null && !d.getStatus().isBlank()) {
            return d.getStatus();
        }
        return Boolean.TRUE.equals(d.getVerified()) ? "APPROVED" : "PENDING";
    }
}