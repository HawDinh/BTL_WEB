package com.example.BTL_Nhom7_OOP.service;

import com.example.BTL_Nhom7_OOP.entity.Doctor;
import com.example.BTL_Nhom7_OOP.exception.ResourceNotFoundException;
import com.example.BTL_Nhom7_OOP.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public Doctor getDoctorById(int id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Bác Sĩ"));
    }

    public List<Doctor> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        if (doctors.isEmpty()) {
            throw new ResourceNotFoundException("Không có Bác Sĩ nào");
        }
        return doctors;
    }

    public Doctor updateInforDoctor(int id, Doctor newDoctor) {
        Doctor doctor = getDoctorById(id);
        doctor.setName(newDoctor.getName());
        doctor.setRoom(newDoctor.getRoom());
        doctor.setExperience(newDoctor.getExperience());
        doctor.setStatus(newDoctor.getStatus());
        return doctorRepository.save(doctor);
    }

    public Doctor setStatusDoctor(int id, String status) {
        Doctor doctor = getDoctorById(id);
        doctor.setStatus(status);
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(int id) {
        Doctor doctor = getDoctorById(id);
        doctorRepository.delete(doctor);
    }

}
