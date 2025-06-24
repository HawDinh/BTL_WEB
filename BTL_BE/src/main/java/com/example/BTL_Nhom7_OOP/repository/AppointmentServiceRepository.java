package com.example.BTL_Nhom7_OOP.repository;

import com.example.BTL_Nhom7_OOP.entity.Appointment;
import com.example.BTL_Nhom7_OOP.entity.AppointmentService;
import com.example.BTL_Nhom7_OOP.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentServiceRepository extends JpaRepository<AppointmentService, Integer> {
    List<AppointmentService> findByAppointment(Appointment appointment);
    List<AppointmentService> findByService(Service service);
    List<AppointmentService> findByStatus(String status);
} 