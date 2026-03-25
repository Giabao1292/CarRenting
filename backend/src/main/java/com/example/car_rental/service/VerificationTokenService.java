package com.example.car_rental.service;

import com.example.car_rental.model.VerificationToken;
import com.example.car_rental.repository.VerificationTokenRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class VerificationTokenService {
    private final VerificationTokenRepository verificationTokenRepository;

    public VerificationTokenService(VerificationTokenRepository verificationTokenRepository) {
        this.verificationTokenRepository = verificationTokenRepository;
    }

    public String saveVerificationToken(String email) {
        VerificationToken token = new VerificationToken();
        token.setEmail(email);
        String to = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        token.setToken(to);
        token.setExpiryDate(Instant.now().plus(15, ChronoUnit.MINUTES));
        verificationTokenRepository.save(token);
        return to;
    }
}
