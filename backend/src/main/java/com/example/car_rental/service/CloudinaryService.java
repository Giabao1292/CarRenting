package com.example.car_rental.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.model.User;
import com.example.car_rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    public String uploadIdentityDocument(MultipartFile file, String documentType, Integer userId) {

        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", "identity/" + userId,
                    "public_id", documentType + "_" + System.currentTimeMillis(),
                    "overwrite", true,
                    "resource_type", "image"
            );

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}