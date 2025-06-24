package com.example.BTL_Nhom7_OOP.dto.request;

import java.time.LocalDateTime;

public class AppointmentRequest {
    private Integer id; // ID của lịch hẹn (nếu là cập nhật)
    private String ownerName;
    private String petName;
    private Integer petAge;

    private LocalDateTime appointmentDateTime;

    private String nickname = ""; // Không bắt buộc
    private String notes = ""; // Không bắt buộc
    private Integer preferredDoctorId; // ID bác sĩ ưu tiên (có thể null nếu khách không chọn)
    private Integer doctorId; // ID bác sĩ được chỉ định
    private String status = "Scheduled"; // Trạng thái mặc định là đã lên lịch

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

    public Integer getPreferredDoctorId() {
        return preferredDoctorId;
    }

    public void setPreferredDoctorId(Integer preferredDoctorId) {
        this.preferredDoctorId = preferredDoctorId;
    }
    
    public Integer getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Integer doctorId) {
        this.doctorId = doctorId;
    }
    
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
