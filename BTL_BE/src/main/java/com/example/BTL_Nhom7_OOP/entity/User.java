package com.example.BTL_Nhom7_OOP.entity;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    String id;

    @Column(name = "username", unique = true)
    String username;

    @Column(name = "password")
    String password;

    @Column(name = "phone_number")
    String phoneNumber;

    @Column(name = "gender")
    String gender;

    @Column(name = "email")
    String email;

    @Column(name = "address")
    String address;

    @Column(name = "date_of_birth")
    LocalDate dateOfBirth;

    @OneToMany(mappedBy = "user")
    List<UserRole> userRoles;
    
    @OneToMany(mappedBy = "owner")
    List<Pet> pets;
}