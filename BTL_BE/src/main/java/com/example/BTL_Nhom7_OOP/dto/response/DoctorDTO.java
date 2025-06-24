package com.example.BTL_Nhom7_OOP.dto.response;

import com.example.BTL_Nhom7_OOP.entity.Doctor;

public class DoctorDTO {
    private int id;

    private String name;
    private String room;
    private String experience;
    private String status;

    public DoctorDTO(int id, String name, String room, String experience, String status) {
        this.id = id;
        this.name = name;
        this.room = room;
        this.experience = experience;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public static DoctorDTO fromEntity(Doctor doctor) {
        if (doctor == null) {
            return null;
        }
        return new DoctorDTO(
                doctor.getId(),
                doctor.getName(),
                doctor.getRoom(),
                doctor.getExperience(),
                doctor.getStatus()
        );
    }
}
