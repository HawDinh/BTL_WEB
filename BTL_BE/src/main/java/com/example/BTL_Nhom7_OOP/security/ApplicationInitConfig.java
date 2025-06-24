package com.example.BTL_Nhom7_OOP.security;

import com.example.BTL_Nhom7_OOP.constant.PredefinedRole;
import com.example.BTL_Nhom7_OOP.entity.Role;
import com.example.BTL_Nhom7_OOP.entity.User;
import com.example.BTL_Nhom7_OOP.entity.UserRole;
import com.example.BTL_Nhom7_OOP.repository.RoleRepository;
import com.example.BTL_Nhom7_OOP.repository.UserRepository;
import com.example.BTL_Nhom7_OOP.repository.UserRoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class   ApplicationInitConfig {

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;

    @NonFinal
    static final String ADMIN_USER_NAME = "admin";

    @NonFinal
    static final String ADMIN_PASSWORD = "admin123";

    // Tạo tài khoản admin nếu chưa có
    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        log.info("Initializing application.....");
        return args -> {
            if (userRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {
                // Tạo role ADMIN nếu chưa tồn tại
                Role adminRole = roleRepository.findByName(PredefinedRole.ADMIN_ROLE)
                        .orElseGet(() -> {
                            Role role = new Role();
                            role.setName(PredefinedRole.ADMIN_ROLE);
                            role.setDescription("Administrator role");
                            return roleRepository.save(role);
                        });

                // Tạo role CUSTOMER nếu chưa tồn tại
                Role customerRole = roleRepository.findByName(PredefinedRole.CUSTOMER_ROLE)
                        .orElseGet(() -> {
                            Role role = new Role();
                            role.setName(PredefinedRole.CUSTOMER_ROLE);
                            role.setDescription("Customer role");
                            return roleRepository.save(role);
                        });

                // Tạo user admin
                User adminUser = new User();
                adminUser.setUsername(ADMIN_USER_NAME);
                adminUser.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                adminUser.setPhoneNumber("0321333898");
                adminUser.setGender("Male");

                // Lưu user và gán roles
                User savedUser = userRepository.save(adminUser);

                // Tạo UserRole
                UserRole adminUserRole1 = new UserRole();
                adminUserRole1.setUser(savedUser);
                adminUserRole1.setRole(adminRole);

                UserRole adminUserRole2 = new UserRole();
                adminUserRole2.setUser(savedUser);
                adminUserRole2.setRole(customerRole);

                // Lưu UserRole
                 userRoleRepository.save(adminUserRole1);
                 userRoleRepository.save(adminUserRole2);

                log.warn("Admin user has been created with default password: admin123. Please change it");
            }
            log.info("Application initialization completed .....");
        };
    }
}
