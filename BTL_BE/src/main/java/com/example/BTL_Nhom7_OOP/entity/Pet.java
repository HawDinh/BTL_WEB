package com.example.BTL_Nhom7_OOP.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pets")
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pet_id")
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "species")
    private String species;
    
    @Column(name = "breed")
    private String breed;
    
    @Column(name = "color")
    private String color;
    
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @Column(name = "gender")
    private String gender;
    
    @Column(name = "description", columnDefinition = "text")
    private String description;
    
    @Column(name = "created_at")
    private LocalDate createdAt;
    
    @Column(name = "updated_at")
    private LocalDate updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }
} 