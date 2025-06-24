package com.example.BTL_Nhom7_OOP.security;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ComponentScan(basePackages = {"com.example.BTL_Nhom7_OOP"})
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Cho phép tất cả các endpoint
                .allowedOrigins("http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:5500", "http://localhost:5501") // Domain của frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Phương thức cho phép
                .allowedHeaders("*") // Tất cả các header
                .allowCredentials(true); // Cho phép gửi cookie
    }
}