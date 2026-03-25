package com.example.car_rental.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final UserService userService;

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(Object value) {
        return (Map<String, Object>) value;
    }

    public String uploadProfile(MultipartFile file, String email) {
        try {
            Map<String, Object> uploadResult = toMap(cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "avatars")));
            String secureUrl = uploadResult.get("secure_url").toString();
            userService.saveAvatar(secureUrl, email);
            return secureUrl;
        } catch (Exception e) {
            throw new RuntimeException("Upload Profile Failed");
        }
    }

    public String uploadIdentityDocument(MultipartFile file, String documentType, Integer userId) {

        try {
            Map<String, Object> uploadParams = toMap(ObjectUtils.asMap(
                    "folder", "identity/" + userId,
                    "public_id", documentType + "_" + System.currentTimeMillis(),
                    "overwrite", true,
                    "resource_type", "image"));

            Map<String, Object> uploadResult = toMap(cloudinary.uploader().upload(file.getBytes(), uploadParams));

            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String uploadVehicleImage(MultipartFile file, Integer vehicleId) {
        try {
            Map<String, Object> uploadParams = toMap(ObjectUtils.asMap(
                    "folder", "vehicles/" + vehicleId,
                    "public_id", "vehicle_" + System.currentTimeMillis(),
                    "overwrite", false,
                    "resource_type", "image"));

            Map<String, Object> uploadResult = toMap(cloudinary.uploader().upload(file.getBytes(), uploadParams));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Upload vehicle image failed");
        }
    }
}