package com.example.car_rental.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
@Service
public class SearchCriteriaService {
    public String extractValue(String key, String... search) {
        if(search == null) return null;
        for (String searchStr : search) {
            Matcher matcher = Pattern.compile("^(\\w+)([:<>])(.*)$")
                    .matcher(searchStr);
            if (matcher.find() && matcher.group(1).equals(key)) {
                return matcher.group(3).trim();
            }
        }
        return null;
    }
    public LocalDateTime extractDateTime(String key, String... search) {
        String value = extractValue(key, search);
        if (value == null) return null;
        return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
