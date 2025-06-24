package com.example.BTL_Nhom7_OOP.repository;

import com.example.BTL_Nhom7_OOP.entity.Appointment;
import com.example.BTL_Nhom7_OOP.entity.Pet;
import com.example.BTL_Nhom7_OOP.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findAllByOwnerName(String name);
    List<Appointment> findAllByAppointmentDateTime(LocalDateTime date);
    List<Appointment> findAllByStatus(String status);
    List<Appointment> findByCustomer(User customer);
    List<Appointment> findByPet(Pet pet);
}
