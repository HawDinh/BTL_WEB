package com.example.BTL_Nhom7_OOP.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IntrospectResponse {
    boolean valid;
    String sub;  // subject (username)
    List<String> authorities;  // danh sách quyền
}
