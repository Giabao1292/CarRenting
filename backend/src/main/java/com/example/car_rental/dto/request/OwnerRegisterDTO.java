package com.example.car_rental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
public class OwnerRegisterDTO {

    @NotBlank(message = "Hình thức đăng ký không được để trống")
    private String ownerType; // INDIVIDUAL | BUSINESS

    @NotBlank(message = "Loại cư trú không được để trống")
    private String residencyType; // PERMANENT | TEMPORARY

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 150, message = "Họ và tên tối đa 150 ký tự")
    private String fullName;

    @NotBlank(message = "Thành phố không được để trống")
    @Size(max = 120, message = "Thành phố tối đa 120 ký tự")
    private String city;

    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    private String address;

    @NotBlank(message = "Số CCCD/CMND không được để trống")
    @Pattern(regexp = "^[0-9]{9,12}$", message = "Số CCCD/CMND phải từ 9-12 chữ số")
    private String idNumber;
}