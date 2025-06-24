package com.example.BTL_Nhom7_OOP.mapper;

import com.example.BTL_Nhom7_OOP.dto.request.UserRoleRequest;
import com.example.BTL_Nhom7_OOP.dto.response.UserRoleResponse;
import com.example.BTL_Nhom7_OOP.entity.UserRole;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserRoleMapper {
    UserRole toUserRole(UserRoleRequest request);

    UserRoleResponse toUserRoleResponse(UserRole userRole);
}
