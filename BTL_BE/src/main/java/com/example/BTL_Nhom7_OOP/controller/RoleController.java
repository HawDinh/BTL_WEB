package com.example.BTL_Nhom7_OOP.controller;

import com.example.BTL_Nhom7_OOP.dto.request.RoleRequest;
import com.example.BTL_Nhom7_OOP.dto.response.ApiResponse;
import com.example.BTL_Nhom7_OOP.dto.response.RoleResponse;
import com.example.BTL_Nhom7_OOP.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleController {
    RoleService roleService;
    // Tạo role
    @PostMapping
    ApiResponse<RoleResponse> createRole(@RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.create(request))
                .build();
    }

    @GetMapping("/get_all_role")
    ApiResponse<List<RoleResponse>> getAll(){
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleService.getAll())
                .build();
    }

    @GetMapping("/get_role_by_id/{id}")
    ApiResponse<RoleResponse> getById(@PathVariable int id){
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.findById(id))
                .build();
    }

    @PutMapping("/update_role/{id}")
    ApiResponse<RoleResponse> update(@PathVariable int id, @RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.update(id, request))
                .build();
    }

    @DeleteMapping("/{roleId}")
    ApiResponse<String> delete(@PathVariable int roleId){
        roleService.delete(roleId);
        return ApiResponse.<String>builder()
                .result("Role has been deleted")
                .build();
    }
}
