package com.example.BTL_Nhom7_OOP.mapper;

import com.example.BTL_Nhom7_OOP.dto.request.UserCreationRequest;
import com.example.BTL_Nhom7_OOP.dto.request.UserUpdateRequest;
import com.example.BTL_Nhom7_OOP.dto.response.UserResponse;
import com.example.BTL_Nhom7_OOP.entity.User;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
