package com.example.BTL_Nhom7_OOP.controller;

import com.example.BTL_Nhom7_OOP.dto.response.DoctorDTO;
import com.example.BTL_Nhom7_OOP.dto.request.DoctorRequest;
import com.example.BTL_Nhom7_OOP.entity.Doctor;
import com.example.BTL_Nhom7_OOP.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:5500", "http://localhost:5501"}, allowCredentials = "true")
public class DoctorController {
    @Autowired
    private DoctorService doctorService;

    @PostMapping
    public ResponseEntity<DoctorDTO> createDoctor(@RequestBody DoctorRequest doctorRequest) {
        Doctor doctor = new Doctor();
        doctor.setName(doctorRequest.getName());
        doctor.setRoom(doctorRequest.getRoom());
        doctor.setExperience(doctorRequest.getExperience());
        doctor.setStatus(doctorRequest.getStatus());

        Doctor createdDoctor = doctorService.createDoctor(doctor);
        return ResponseEntity.ok(DoctorDTO.fromEntity(createdDoctor));
    }

    @GetMapping("/get_doctor/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable int id) {
        Doctor doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(DoctorDTO.fromEntity(doctor));
    }

    @GetMapping("/get_all_doctor")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        List<DoctorDTO> doctorDTOS = new ArrayList<>();
        for (Doctor doctor : doctors) {
            doctorDTOS.add(DoctorDTO.fromEntity(doctor));
        }
        return ResponseEntity.ok(doctorDTOS);
    }

    @PutMapping("/update_infor_doctor/{id}")
    public ResponseEntity<DoctorDTO> updateDoctor(@PathVariable int id, @RequestBody DoctorRequest doctorRequest) {
        Doctor doctor = new Doctor();
        doctor.setName(doctorRequest.getName());
        doctor.setRoom(doctorRequest.getRoom());
        doctor.setExperience(doctorRequest.getExperience());
        doctor.setStatus(doctorRequest.getStatus());
        Doctor newDoctor = doctorService.updateInforDoctor(id, doctor);
        return ResponseEntity.ok(DoctorDTO.fromEntity(newDoctor));
    }

    @PutMapping("/set_status_doctor/{id}/{status}")
    public ResponseEntity<DoctorDTO> setDoctorStatus(@PathVariable int id, @PathVariable String status) {
        Doctor newDoctor = doctorService.setStatusDoctor(id, status);
        return ResponseEntity.ok(DoctorDTO.fromEntity(newDoctor));
    }

    @DeleteMapping("/delete_doctor/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable int id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok("Đã xóa thành công bác sĩ với ID: " + id);
    }

}
