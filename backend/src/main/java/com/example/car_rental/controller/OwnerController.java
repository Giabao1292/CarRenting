package com.example.car_rental.controller;


import com.example.car_rental.dto.request.AdminRejectOwnerRequest;
import com.example.car_rental.dto.request.OwnerRegisterDTO;
import com.example.car_rental.dto.response.AdminOwnerDetailResponse;
import com.example.car_rental.dto.response.AdminOwnerResponse;
import com.example.car_rental.dto.response.AdminOwnerSummaryResponse;
import com.example.car_rental.dto.request.TimeOwnerRequestDTO;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.dto.response.TimeOwnerResponseDTO;
import com.example.car_rental.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Time;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
@Validated
public class OwnerController {
    private final OwnerService ownerService;

    @PostMapping
    public ResponseData<String> registerOwner(@RequestPart("data") @Valid OwnerRegisterDTO ownerRegisterDTO,
                                              @RequestPart("idCardFront") MultipartFile idCardFront,
                                              @RequestPart("idCardBack") MultipartFile idCardBack, Authentication authentication) {

        ownerService.registerOwner(ownerRegisterDTO,idCardBack, idCardFront, authentication.getName());
        return new ResponseData<>(200, "Owner registered successfully");
    }
    @GetMapping("/me/status")
    public ResponseData<String> getStatus(Authentication authentication) {
        String status = ownerService.getStatus(authentication.getName());
        return new ResponseData<>(200, "Owner status retrieved successfully", status);
    }
    @GetMapping("/admin/summary")
    public ResponseData<AdminOwnerSummaryResponse> getAdminOwnerSummary() {
        AdminOwnerSummaryResponse response = ownerService.getAdminOwnerSummary();
        return new ResponseData<>(200, "Get owner summary successfully", response);
    }

    @GetMapping("/admin/pending")
    public ResponseData<Page<AdminOwnerResponse>> getPendingOwners(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminOwnerResponse> response = ownerService.getPendingOwners(keyword, page, size);
        return new ResponseData<>(200, "Get pending owners successfully", response);
    }

    @GetMapping("/admin/approved")
    public ResponseData<Page<AdminOwnerResponse>> getApprovedOwners(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminOwnerResponse> response = ownerService.getApprovedOwners(keyword, page, size);
        return new ResponseData<>(200, "Get approved owners successfully", response);
    }

    @GetMapping("/admin/rejected")
    public ResponseData<Page<AdminOwnerResponse>> getRejectedOwners(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminOwnerResponse> response = ownerService.getRejectedOwners(keyword, page, size);
        return new ResponseData<>(200, "Get rejected owners successfully", response);
    }

    @GetMapping("/admin/{id}")
    public ResponseData<AdminOwnerDetailResponse> getOwnerDetail(@PathVariable Integer id) {
        AdminOwnerDetailResponse response = ownerService.getOwnerDetail(id);
        return new ResponseData<>(200, "Get owner detail successfully", response);
    }

    @PutMapping("/admin/{id}/approve")
    public ResponseData<Void> approveOwner(@PathVariable Integer id) {
        ownerService.approveOwner(id);
        return new ResponseData<>(200, "Approve owner successfully", null);
    }

    @PutMapping("/admin/{id}/reject")
    public ResponseData<Void> rejectOwner(
            @PathVariable Integer id,
            @Valid @RequestBody AdminRejectOwnerRequest request
    ) {
        ownerService.rejectOwner(id, request);
        return new ResponseData<>(200, "Reject owner successfully", null);
    }

    @PutMapping("/me/time")
    public ResponseData<String> updateTime(Authentication authentication,@RequestBody TimeOwnerRequestDTO timeOwnerRequestDTO) {
        ownerService.updateTime(authentication.getName(), timeOwnerRequestDTO);
        return new ResponseData<>(200, "Owner time updated successfully");
    }
    @GetMapping("/me/time")
    public ResponseData<TimeOwnerResponseDTO> getTime(Authentication authentication) {
        TimeOwnerResponseDTO timeOwnerResponseDTO = ownerService.getTime(authentication.getName());
        return new ResponseData<>(200, "Owner time retrieved successfully", timeOwnerResponseDTO);
    }
}
