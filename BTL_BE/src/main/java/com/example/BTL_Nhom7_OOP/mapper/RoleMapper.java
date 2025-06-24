package com.example.BTL_Nhom7_OOP.mapper;

import com.example.BTL_Nhom7_OOP.dto.request.RoleRequest;
import com.example.BTL_Nhom7_OOP.dto.response.RoleResponse;
import com.example.BTL_Nhom7_OOP.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
