package com.example.car_rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.car_rental.model.User;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findUserByEmail(String email);


}
