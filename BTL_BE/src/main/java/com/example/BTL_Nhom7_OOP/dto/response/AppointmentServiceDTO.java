package com.example.BTL_Nhom7_OOP.dto.response;

import java.time.LocalDateTime;

import com.example.BTL_Nhom7_OOP.entity.AppointmentService;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentServiceDTO {
    private Integer id;
    private Integer appointmentId;
    private Integer serviceId;
    private String serviceName;
    private String note;
    private Integer price;
    private Integer quantity;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static AppointmentServiceDTO fromEntity(AppointmentService appointmentService) {
        if (appointmentService == null) {
            return null;
        }
        
        return AppointmentServiceDTO.builder()
            .id(appointmentService.getId())
            .appointmentId(appointmentService.getAppointment() != null ? appointmentService.getAppointment().getId() : null)
            .serviceId(appointmentService.getService() != null ? appointmentService.getService().getId() : null)
            .serviceName(appointmentService.getService() != null ? appointmentService.getService().getName() : null)
            .note(appointmentService.getNote())
            .price(appointmentService.getPrice())
            .quantity(appointmentService.getQuantity())
            .status(appointmentService.getStatus())
            .createdAt(appointmentService.getCreatedAt())
            .updatedAt(appointmentService.getUpdatedAt())
            .build();
    }
} 