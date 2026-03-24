package com.example.car_rental.dto.request;

import lombok.Data;
import lombok.Getter;

import java.time.LocalTime;

@Getter
public class TimeOwnerRequestDTO {
    LocalTime open;
    LocalTime close;
}
