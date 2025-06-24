package com.example.BTL_Nhom7_OOP.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Integer id;

    @Column(name = "owner_name")
    private String ownerName;
    
    @Column(name = "nickname")
    private String nickname;
    
    @Column(name = "notes", columnDefinition = "text")
    private String notes;
    
    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "appointment_date")
    private LocalDateTime appointmentDateTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "preferred_doctor_id")
    private Doctor preferredDoctor;
    
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;
    
    @ManyToOne
    @JoinColumn(name = "pet_id")
    private Pet pet;
    
    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL)
    private List<AppointmentService> appointmentServices;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
