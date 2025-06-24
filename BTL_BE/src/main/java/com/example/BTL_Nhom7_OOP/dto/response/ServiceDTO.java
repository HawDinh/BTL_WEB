package com.example.BTL_Nhom7_OOP.dto.response;

import java.time.LocalDateTime;

import com.example.BTL_Nhom7_OOP.entity.Service;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDTO {
    private Integer id;
    private String name;
    private Integer price;
    private String description;
    private Integer duration;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ServiceDTO fromEntity(Service service) {
        if (service == null) {
            return null;
        }
        
        return ServiceDTO.builder()
            .id(service.getId())
            .name(service.getName())
            .price(service.getPrice())
            .description(service.getDescription())
            .duration(service.getDuration())
            .status(service.getStatus())
            .createdAt(service.getCreatedAt())
            .updatedAt(service.getUpdatedAt())
            .build();
    }
} 