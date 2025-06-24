package com.example.BTL_Nhom7_OOP.service;

import com.example.BTL_Nhom7_OOP.constant.PredefinedRole;
import com.example.BTL_Nhom7_OOP.dto.request.UserCreationRequest;
import com.example.BTL_Nhom7_OOP.dto.request.UserUpdateRequest;
import com.example.BTL_Nhom7_OOP.dto.response.UserResponse;
import com.example.BTL_Nhom7_OOP.entity.Role;
import com.example.BTL_Nhom7_OOP.entity.User;
import com.example.BTL_Nhom7_OOP.entity.UserRole;
import com.example.BTL_Nhom7_OOP.exception.AppException;
import com.example.BTL_Nhom7_OOP.exception.ErrorCode;
import com.example.BTL_Nhom7_OOP.exception.ResourceNotFoundException;
import com.example.BTL_Nhom7_OOP.mapper.UserMapper;
import com.example.BTL_Nhom7_OOP.repository.RoleRepository;
import com.example.BTL_Nhom7_OOP.repository.UserRepository;
import com.example.BTL_Nhom7_OOP.repository.UserRoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;

    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        // Mã hóa mật khẩu cho user khi tạo
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Code ...để gán mặc định quyền là CUSTOMER
        try {
            user = userRepository.save(user);
            // Tìm role CUSTOMER mặc định
            Role customRole = roleRepository.findByName(PredefinedRole.CUSTOMER_ROLE)
                    .orElseThrow(() -> new ResourceNotFoundException("Default CUSTOMER role not found"));
            // Tạo UserRole mặc định
            UserRole userRole = UserRole.builder()
                    .role(customRole)
                    .user(user)
                    .build();
            userRoleRepository.save(userRole);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        return userMapper.toUserResponse(user);
    }

    // Lấy thông tin của chính mình (bỏ kiểm tra quyền)
    public UserResponse getMyInfo(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    // Cập nhật user (bỏ kiểm tra quyền)
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Username
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }
            user.setUsername(request.getUsername());
        }

        // Password
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Phone number
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        // Gender
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        // Email
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        // Address
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        // Date of birth
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    public List<UserResponse> getUsers() {
        log.info("In method get users");
        return userRepository.findAll()
                .stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(
                userRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }
}