package com.example.BTL_Nhom7_OOP.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Đảm bảo các API endpoint được xử lý bởi controller thay vì static resource handler
        configurer.setUseTrailingSlashMatch(false);
        configurer.setUseSuffixPatternMatch(false);
    }
} 