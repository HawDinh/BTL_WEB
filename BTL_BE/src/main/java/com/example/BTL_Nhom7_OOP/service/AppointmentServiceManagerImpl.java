package com.example.BTL_Nhom7_OOP.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.BTL_Nhom7_OOP.dto.request.AppointmentServiceRequest;
import com.example.BTL_Nhom7_OOP.entity.Appointment;
import com.example.BTL_Nhom7_OOP.entity.AppointmentService;
import com.example.BTL_Nhom7_OOP.exception.AppException;
import com.example.BTL_Nhom7_OOP.exception.ErrorCode;
import com.example.BTL_Nhom7_OOP.repository.AppointmentRepository;
import com.example.BTL_Nhom7_OOP.repository.AppointmentServiceRepository;
import com.example.BTL_Nhom7_OOP.repository.ServiceRepository;

@Service
public class AppointmentServiceManagerImpl {

    @Autowired
    private AppointmentServiceRepository appointmentServiceRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    public List<AppointmentService> getAllAppointmentServices() {
        return appointmentServiceRepository.findAll();
    }
    
    public AppointmentService getAppointmentServiceById(Integer id) {
        return appointmentServiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_SERVICE_NOT_FOUND));
    }
    
    public List<AppointmentService> getAppointmentServicesByAppointment(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        return appointmentServiceRepository.findByAppointment(appointment);
    }
    
    public List<AppointmentService> getAppointmentServicesByStatus(String status) {
        return appointmentServiceRepository.findByStatus(status);
    }
    
    public AppointmentService createAppointmentService(AppointmentServiceRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
        
        com.example.BTL_Nhom7_OOP.entity.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_FOUND));
        
        AppointmentService appointmentService = new AppointmentService();
        appointmentService.setAppointment(appointment);
        appointmentService.setService(service);
        appointmentService.setNote(request.getNote());
        appointmentService.setPrice(request.getPrice() != null ? request.getPrice() : service.getPrice());
        appointmentService.setQuantity(request.getQuantity() != null ? request.getQuantity() : 1);
        appointmentService.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        
        return appointmentServiceRepository.save(appointmentService);
    }
    
    public AppointmentService updateAppointmentService(Integer id, AppointmentServiceRequest request) {
        AppointmentService appointmentService = getAppointmentServiceById(id);
        
        if (request.getNote() != null) {
            appointmentService.setNote(request.getNote());
        }
        if (request.getPrice() != null) {
            appointmentService.setPrice(request.getPrice());
        }
        if (request.getQuantity() != null) {
            appointmentService.setQuantity(request.getQuantity());
        }
        if (request.getStatus() != null) {
            appointmentService.setStatus(request.getStatus());
        }
        
        // Có thể cân nhắc cập nhật mối quan hệ nếu cần
        if (request.getAppointmentId() != null && 
            !request.getAppointmentId().equals(appointmentService.getAppointment().getId())) {
            Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
            appointmentService.setAppointment(appointment);
        }
        
        if (request.getServiceId() != null && 
            !request.getServiceId().equals(appointmentService.getService().getId())) {
            com.example.BTL_Nhom7_OOP.entity.Service service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_FOUND));
            appointmentService.setService(service);
        }
        
        return appointmentServiceRepository.save(appointmentService);
    }
    
    public void deleteAppointmentService(Integer id) {
        AppointmentService appointmentService = getAppointmentServiceById(id);
        appointmentServiceRepository.delete(appointmentService);
    }
} 