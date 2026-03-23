package com.example.car_rental.dto.response;

import lombok.*;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse<T> {
    int totalElements;
    int totalPages;
    int number;
    int size;
    List<T> content;
}
