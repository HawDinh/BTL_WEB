package com.example.BTL_Nhom7_OOP.controller;

import com.example.BTL_Nhom7_OOP.dto.response.ApiResponse;
import com.example.BTL_Nhom7_OOP.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/count")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:5500", "http://localhost:5501"}, allowCredentials = "true")
public class CountController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping("/pets")
    public ApiResponse<Long> countPets() {
        return ApiResponse.<Long>builder()
                .result(petRepository.count())
                .build();
    }

    @GetMapping("/services")
    public ApiResponse<Long> countServices() {
        return ApiResponse.<Long>builder()
                .result(serviceRepository.count())
                .build();
    }

    @GetMapping("/articles")
    public ApiResponse<Long> countArticles() {
        return ApiResponse.<Long>builder()
                .result(articleRepository.count())
                .build();
    }

    @GetMapping("/users")
    public ApiResponse<Long> countUsers() {
        return ApiResponse.<Long>builder()
                .result(userRepository.count())
                .build();
    }

    @GetMapping("/dashboard/stats")
    public ApiResponse<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("pets", petRepository.count());
        stats.put("services", serviceRepository.count());
        stats.put("articles", articleRepository.count());
        stats.put("users", userRepository.count());
        
        return ApiResponse.<Map<String, Long>>builder()
                .result(stats)
                .build();
    }
} 