package com.example.car_rental.service;

import com.example.car_rental.dto.request.OwnerRegisterDTO;
import com.example.car_rental.dto.request.TimeOwnerRequestDTO;
import com.example.car_rental.dto.response.TimeOwnerResponseDTO;
import com.example.car_rental.model.OwnerProfile;
import com.example.car_rental.model.User;
import com.example.car_rental.repository.OwnerRepository;
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

    public OwnerService(UserService userService, CloudinaryService cloudinaryService, OwnerRepository ownerRepository) {
        this.userService = userService;
        this.cloudinaryService = cloudinaryService;
        this.ownerRepository = ownerRepository;
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
