package com.example.car_rental.service;

import com.example.car_rental.model.User;

public interface UserService {
    public User findByEmail(String username);
}
