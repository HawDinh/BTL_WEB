package com.example.BTL_Nhom7_OOP.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.BTL_Nhom7_OOP.dto.request.ServiceRequest;
import com.example.BTL_Nhom7_OOP.exception.AppException;
import com.example.BTL_Nhom7_OOP.exception.ErrorCode;
import com.example.BTL_Nhom7_OOP.repository.ServiceRepository;

@Service
public class PetServiceManagerImpl {

    @Autowired
    private ServiceRepository serviceRepository;
    
    public List<com.example.BTL_Nhom7_OOP.entity.Service> getAllServices() {
        return serviceRepository.findAll();
    }
    
    public com.example.BTL_Nhom7_OOP.entity.Service getServiceById(Integer id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_FOUND));
    }
    
    public List<com.example.BTL_Nhom7_OOP.entity.Service> getServicesByStatus(String status) {
        return serviceRepository.findByStatus(status);
    }
    
    public List<com.example.BTL_Nhom7_OOP.entity.Service> searchServices(String name) {
        return serviceRepository.findByNameContaining(name);
    }
    
    public com.example.BTL_Nhom7_OOP.entity.Service createService(ServiceRequest serviceRequest) {
        com.example.BTL_Nhom7_OOP.entity.Service service = new com.example.BTL_Nhom7_OOP.entity.Service();
        service.setName(serviceRequest.getName());
        service.setPrice(serviceRequest.getPrice());
        service.setDescription(serviceRequest.getDescription());
        service.setDuration(serviceRequest.getDuration());
        service.setStatus(serviceRequest.getStatus() != null ? serviceRequest.getStatus() : "ACTIVE");
        
        return serviceRepository.save(service);
    }
    
    public com.example.BTL_Nhom7_OOP.entity.Service updateService(Integer id, ServiceRequest serviceRequest) {
        com.example.BTL_Nhom7_OOP.entity.Service service = getServiceById(id);
        
        if (serviceRequest.getName() != null) {
            service.setName(serviceRequest.getName());
        }
        if (serviceRequest.getPrice() != null) {
            service.setPrice(serviceRequest.getPrice());
        }
        if (serviceRequest.getDescription() != null) {
            service.setDescription(serviceRequest.getDescription());
        }
        if (serviceRequest.getDuration() != null) {
            service.setDuration(serviceRequest.getDuration());
        }
        if (serviceRequest.getStatus() != null) {
            service.setStatus(serviceRequest.getStatus());
        }
        
        return serviceRepository.save(service);
    }
    
    public void deleteService(Integer id) {
        com.example.BTL_Nhom7_OOP.entity.Service service = getServiceById(id);
        serviceRepository.delete(service);
    }
} 