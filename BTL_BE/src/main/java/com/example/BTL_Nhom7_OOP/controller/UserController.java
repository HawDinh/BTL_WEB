package com.example.BTL_Nhom7_OOP.controller;

import com.example.BTL_Nhom7_OOP.dto.request.UserCreationRequest;
import com.example.BTL_Nhom7_OOP.dto.request.UserUpdateRequest;
import com.example.BTL_Nhom7_OOP.dto.response.ApiResponse;
import com.example.BTL_Nhom7_OOP.dto.response.UserResponse;
import com.example.BTL_Nhom7_OOP.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;
    // Tạo user, trong đó đc gán sẵn role là CUSTOMER
    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }
    // Lấy thông tin của tất cả Users (chỉ có ADMIN)
    @GetMapping
    ApiResponse<List<UserResponse>> getUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }
    // Lấy thông tin của User bằng ID (chỉ có ADMIN)
    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }
    // Lấy thông tin của cá nhân User (bằng Token)
    @GetMapping("/myInfo")
    ApiResponse<UserResponse> getMyInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo(username))
                .build();
    }
    // Cập nhật thông tin User qua ID (password, firstName, lastName, dob)
    @PutMapping("/{userId}")
    ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(userId, request))
                .build();
    }
    // Xóa User qua ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") String id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok("Xóa user thành công");
    }
}
