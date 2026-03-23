package com.example.car_rental.service.impl;

import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.model.User;
import com.example.car_rental.repository.UserRepository;
import com.example.car_rental.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User findByEmail(String email) {
        return userRepository.findUserByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Wrong username or password"));
    }

    @Override
    public void saveAvatar(String avatarUrl, String email) {
        User user = userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + email));
        user.setAvatar(avatarUrl);
        userRepository.save(user);
    }
}
