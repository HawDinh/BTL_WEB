package com.example.BTL_Nhom7_OOP.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {
    private String name;
    private Integer price;
    private String description;
    private Integer duration;
    private String status;
} 