package com.example.BTL_Nhom7_OOP.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    String username;
    String password;
    String phoneNumber;
    String gender;
    String email;
    String address;
    LocalDate dateOfBirth;
}