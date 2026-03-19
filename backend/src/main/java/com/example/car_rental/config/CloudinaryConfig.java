package com.example.car_rental.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.api-key}")
    private String cloudinary_api_key;
    @Value("${cloudinary.api-secret}")
    private String cloudinary_api_secret;
    @Value("${cloudinary.cloud-name}")
    private String cloudinary_cloud_name;
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudinary_cloud_name);
        config.put("api_key", cloudinary_api_key);
        config.put("api_secret", cloudinary_api_secret);

        return new Cloudinary(config);
    }
}