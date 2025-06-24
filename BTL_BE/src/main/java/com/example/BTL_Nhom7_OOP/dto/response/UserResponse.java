package com.example.BTL_Nhom7_OOP.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String phoneNumber;
    String gender;
    String email;
    String address;
    LocalDate dateOfBirth;
}