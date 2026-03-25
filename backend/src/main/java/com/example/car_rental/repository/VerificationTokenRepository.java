package com.example.car_rental.repository;

import com.example.car_rental.model.VerificationToken;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Integer> {

    Optional<VerificationToken> findByTokenAndEmailAndExpiryDateIsAfterAndUsed(@Size(max = 255) @NotNull String token, @Size(max = 255) @NotNull String email, @NotNull Instant expiryDateAfter, @NotNull Boolean used);
}
