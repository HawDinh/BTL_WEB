package com.example.BTL_Nhom7_OOP.service;

import com.example.BTL_Nhom7_OOP.dto.request.UserRoleRequest;
import com.example.BTL_Nhom7_OOP.dto.response.RoleResponse;
import com.example.BTL_Nhom7_OOP.dto.response.UserRoleResponse;
import com.example.BTL_Nhom7_OOP.entity.Role;
import com.example.BTL_Nhom7_OOP.entity.User;
import com.example.BTL_Nhom7_OOP.entity.UserRole;
import com.example.BTL_Nhom7_OOP.exception.AppException;
import com.example.BTL_Nhom7_OOP.exception.ErrorCode;
import com.example.BTL_Nhom7_OOP.mapper.UserRoleMapper;
import com.example.BTL_Nhom7_OOP.repository.RoleRepository;
import com.example.BTL_Nhom7_OOP.repository.UserRepository;
import com.example.BTL_Nhom7_OOP.repository.UserRoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserRoleService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;
    UserRoleMapper userRoleMapper;

    @Transactional
    public UserRoleResponse assignRole(String userId, int roleId) {
        // Kiểm tra User có tồn tại hay không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Kiểm tra Role có tồn tại hay không
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .build();

        UserRole savedUserRole = userRoleRepository.save(userRole);
        return userRoleMapper.toUserRoleResponse(savedUserRole);
    }

    public List<UserRoleResponse> getAll(){
        return userRoleRepository.findAll()
                .stream()
                .map(userRoleMapper::toUserRoleResponse)
                .toList();
    }

    // update UserRole (gán lại)
    @Transactional
    public UserRoleResponse updateUserRole(int userRoleId, UserRoleRequest userRoleRequest) {
        UserRole existingUserRole = userRoleRepository.findById(userRoleId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ROLE_NOT_EXISTED));

        Role newRole = roleRepository.findById(userRoleRequest.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        User user = userRepository.findById(userRoleRequest.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        existingUserRole.setRole(newRole);
        existingUserRole.setUser(user);

        return userRoleMapper.toUserRoleResponse(userRoleRepository.save(existingUserRole));
    }

    public void deleteUserRole(int userRoleId) {
        userRoleRepository.deleteById(userRoleId);
    }
}
