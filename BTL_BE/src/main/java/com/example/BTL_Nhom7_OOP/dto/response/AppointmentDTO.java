package com.example.BTL_Nhom7_OOP.dto.response;

import com.example.BTL_Nhom7_OOP.entity.Appointment;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class AppointmentDTO {
    private Integer id;

    private String ownerName;
    private String petName;
    private Integer petAge;
    private PetDTO pet;

    private LocalDateTime appointmentDateTime;
    private String nickname;
    private String notes;
    private String status;
    private DoctorDTO preferredDoctor;
    private DoctorDTO doctor;
    private String customerUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AppointmentDTO(Integer id, String ownerName, String petName, Integer petAge, 
                         LocalDateTime appointmentDateTime, String nickname, String notes, 
                         String status, DoctorDTO preferredDoctor, DoctorDTO doctor, 
                         String customerUsername, 
                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.ownerName = ownerName;
        this.petName = petName;
        this.petAge = petAge;
        this.appointmentDateTime = appointmentDateTime;
        this.nickname = nickname;
        this.notes = notes;
        this.status = status;
        this.preferredDoctor = preferredDoctor;
        this.doctor = doctor;
        this.customerUsername = customerUsername;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getPetName() {
        return petName;
    }

    public void setPetName(String petName) {
        this.petName = petName;
    }

    public Integer getPetAge() {
        return petAge;
    }

    public void setPetAge(Integer petAge) {
        this.petAge = petAge;
    }
    
    public PetDTO getPet() {
        return pet;
    }

    public void setPet(PetDTO pet) {
        this.pet = pet;
    }

    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public DoctorDTO getPreferredDoctor() {
        return preferredDoctor;
    }

    public void setPreferredDoctor(DoctorDTO preferredDoctor) {
        this.preferredDoctor = preferredDoctor;
    }

    public DoctorDTO getDoctor() {
        return doctor;
    }

    public void setDoctor(DoctorDTO doctor) {
        this.doctor = doctor;
    }
    
    public String getCustomerUsername() {
        return customerUsername;
    }

    public void setCustomerUsername(String customerUsername) {
        this.customerUsername = customerUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static AppointmentDTO fromEntity(Appointment appointment) {
        String petName = null;
        Integer petAge = null;
        
        // Lấy thông tin từ pet nếu có
        if (appointment.getPet() != null) {
            petName = appointment.getPet().getName();
            // Tính tuổi từ ngày sinh nếu có
            if (appointment.getPet().getBirthDate() != null) {
                petAge = java.time.Period.between(appointment.getPet().getBirthDate(), java.time.LocalDate.now()).getYears();
            }
        }
        
        AppointmentDTO dto = new AppointmentDTO(
                appointment.getId(),
                appointment.getOwnerName(),
                petName,
                petAge,
                appointment.getAppointmentDateTime(),
                appointment.getNickname(),
                appointment.getNotes(),  
                appointment.getStatus(),
                appointment.getPreferredDoctor() != null ? DoctorDTO.fromEntity(appointment.getPreferredDoctor()) : null,
                appointment.getDoctor() != null ? DoctorDTO.fromEntity(appointment.getDoctor()) : null,
                appointment.getCustomer() != null ? appointment.getCustomer().getUsername() : null,
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
        
        // Thêm thông tin đầy đủ của pet nếu có
        if (appointment.getPet() != null) {
            dto.setPet(PetDTO.fromEntity(appointment.getPet()));
        }
        
        return dto;
    }
    
    // Thêm constructor không tham số để serialize/deserialize dễ dàng
    public AppointmentDTO() {
    }
}
