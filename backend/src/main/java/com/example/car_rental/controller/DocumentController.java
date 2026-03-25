package com.example.car_rental.controller;

import com.example.car_rental.dto.request.AdminRejectCarRequest;
import com.example.car_rental.dto.response.AdminLicenseDetailResponse;
import com.example.car_rental.dto.response.AdminLicenseResponse;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/licenses")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/admin")
    public ResponseData<Page<AdminLicenseResponse>> getAllDrivingLicenses(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminLicenseResponse> response =
                documentService.getAllDrivingLicenses(keyword, status, page, size);

        return new ResponseData<>(200, "Get driving licenses successfully", response);
    }

    @GetMapping("/admin/{id}")
    public ResponseData<AdminLicenseDetailResponse> getDrivingLicenseDetail(@PathVariable Integer id) {
        AdminLicenseDetailResponse response = documentService.getDrivingLicenseDetail(id);
        return new ResponseData<>(200, "Get driving license detail successfully", response);
    }

    @PutMapping("/admin/{id}/approve")
    public ResponseData<AdminLicenseDetailResponse> approveDrivingLicense(@PathVariable Integer id) {
        AdminLicenseDetailResponse response = documentService.approveDrivingLicense(id);
        return new ResponseData<>(200, "Approve driving license successfully", response);
    }

    @PutMapping("/admin/{id}/reject")
    public ResponseData<AdminLicenseDetailResponse> rejectDrivingLicense(
            @PathVariable Integer id,
            @Valid @RequestBody AdminRejectCarRequest request
    ) {
        AdminLicenseDetailResponse response = documentService.rejectDrivingLicense(id, request);
        return new ResponseData<>(200, "Reject driving license successfully", response);
    }
}