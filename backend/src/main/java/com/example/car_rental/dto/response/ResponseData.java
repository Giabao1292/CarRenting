package com.example.car_rental.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

@Getter
public class ResponseData<T> {
    private int code;
    private String message;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T data;

    public ResponseData(int code, String message,  T data) {
        this.code = code;
        this.data = data;
        this.message = message;
    }
    public ResponseData(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
