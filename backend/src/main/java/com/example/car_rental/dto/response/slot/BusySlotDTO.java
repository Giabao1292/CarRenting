package com.example.car_rental.dto.response.slot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
public class BusySlotDTO {
    private LocalDateTime start;
    private LocalDateTime end;
}