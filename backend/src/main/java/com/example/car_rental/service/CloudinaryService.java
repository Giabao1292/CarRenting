package com.example.car_rental.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.model.User;
import com.example.car_rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final UserService userService;

    public String uploadProfile(MultipartFile file, String email) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "avatars")
            );
            String secureUrl = uploadResult.get("secure_url").toString();
            userService.saveAvatar(secureUrl, email);
            return secureUrl;
        } catch (Exception e) {
            throw new RuntimeException("Upload Profile Failed");
        }
    }
}