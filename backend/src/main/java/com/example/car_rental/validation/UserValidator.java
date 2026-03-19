package com.example.car_rental.validation;

import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserValidator {
    private final UserRepository userRepository;
    public void validateEmail(String email) {
        if (userRepository.findUserByEmail(email).isPresent()) {
            throw new ResourceNotFoundException("Email đã tồn tại");
        }
    }
}
