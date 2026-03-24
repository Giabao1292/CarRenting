package com.example.car_rental.dto.response;

import lombok.Data;

import java.time.LocalTime;

@Data
public class TimeOwnerResponseDTO {
    LocalTime open;
    LocalTime close;
}
