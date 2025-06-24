package com.example.BTL_Nhom7_OOP.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentServiceRequest {
    private Integer appointmentId;
    private Integer serviceId;
    private String note;
    private Integer price;
    private Integer quantity;
    private String status;
} 