package com.example.car_rental.dto.response.car;

import com.example.car_rental.dto.response.FeatureResponseDTO;
import com.example.car_rental.dto.response.ReviewResponseDTO;
import com.example.car_rental.dto.response.slot.BusySlotDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDetailDTO extends VehicleSummaryDTO {
    private List<FeatureResponseDTO> features;
    private List<BusySlotDTO> busySlots;
    private List<ReviewResponseDTO> reviews;
    private String address;
    private List<String> images;
}