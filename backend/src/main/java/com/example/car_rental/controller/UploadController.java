package com.example.car_rental.controller;
import com.example.car_rental.dto.response.ResponseData;
import com.example.car_rental.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    public UploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/profile")
    public ResponseData<String> uploadProfile(@RequestParam("file") MultipartFile file, Authentication authentication) {
        String secureUrl = cloudinaryService.uploadProfile(file, authentication.getName());
        return new ResponseData<>(HttpStatus.OK.value(),"Upload profile successfully", secureUrl);
    }
}