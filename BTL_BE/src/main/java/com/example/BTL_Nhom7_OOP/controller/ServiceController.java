package com.example.BTL_Nhom7_OOP.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.BTL_Nhom7_OOP.dto.request.ServiceRequest;
import com.example.BTL_Nhom7_OOP.dto.response.ServiceDTO;
import com.example.BTL_Nhom7_OOP.service.PetServiceManagerImpl;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:5500", "http://localhost:5501"}, allowCredentials = "true")
public class ServiceController {

    @Autowired
    private PetServiceManagerImpl serviceManager;
    
    @GetMapping("/count")
    public long countServices() {
        return serviceManager.getAllServices().size();
    }
    
    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        List<com.example.BTL_Nhom7_OOP.entity.Service> services = serviceManager.getAllServices();
        List<ServiceDTO> serviceDTOs = services.stream()
                .map(ServiceDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(serviceDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getServiceById(@PathVariable Integer id) {
        com.example.BTL_Nhom7_OOP.entity.Service service = serviceManager.getServiceById(id);
        return ResponseEntity.ok(ServiceDTO.fromEntity(service));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ServiceDTO>> getServicesByStatus(@PathVariable String status) {
        List<com.example.BTL_Nhom7_OOP.entity.Service> services = serviceManager.getServicesByStatus(status);
        List<ServiceDTO> serviceDTOs = services.stream()
                .map(ServiceDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(serviceDTOs);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ServiceDTO>> searchServices(@RequestParam String name) {
        List<com.example.BTL_Nhom7_OOP.entity.Service> services = serviceManager.searchServices(name);
        List<ServiceDTO> serviceDTOs = services.stream()
                .map(ServiceDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(serviceDTOs);
    }
    
    @PostMapping
    public ResponseEntity<ServiceDTO> createService(@RequestBody ServiceRequest serviceRequest) {
        com.example.BTL_Nhom7_OOP.entity.Service service = serviceManager.createService(serviceRequest);
        return ResponseEntity.ok(ServiceDTO.fromEntity(service));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ServiceDTO> updateService(
            @PathVariable Integer id,
            @RequestBody ServiceRequest serviceRequest) {
        com.example.BTL_Nhom7_OOP.entity.Service service = serviceManager.updateService(id, serviceRequest);
        return ResponseEntity.ok(ServiceDTO.fromEntity(service));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Integer id) {
        serviceManager.deleteService(id);
        return ResponseEntity.noContent().build();
    }
} 