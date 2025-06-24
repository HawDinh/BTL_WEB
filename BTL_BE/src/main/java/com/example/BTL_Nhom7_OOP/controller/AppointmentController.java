package com.example.BTL_Nhom7_OOP.controller;

import com.example.BTL_Nhom7_OOP.dto.response.AppointmentDTO;
import com.example.BTL_Nhom7_OOP.dto.request.AppointmentRequest;
import com.example.BTL_Nhom7_OOP.entity.Appointment;
import com.example.BTL_Nhom7_OOP.entity.Doctor;
import com.example.BTL_Nhom7_OOP.entity.Pet;
import com.example.BTL_Nhom7_OOP.entity.User;
import com.example.BTL_Nhom7_OOP.exception.AppException;
import com.example.BTL_Nhom7_OOP.exception.ErrorCode;
import com.example.BTL_Nhom7_OOP.exception.ResourceNotFoundException;
import com.example.BTL_Nhom7_OOP.repository.AppointmentRepository;
import com.example.BTL_Nhom7_OOP.repository.PetRepository;
import com.example.BTL_Nhom7_OOP.repository.UserRepository;
import com.example.BTL_Nhom7_OOP.service.AppointmentService;
import com.example.BTL_Nhom7_OOP.service.DoctorService;
import com.example.BTL_Nhom7_OOP.service.PetService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:5500", "http://localhost:5501"}, allowCredentials = "true")
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorService doctorService;
    
    @Autowired
    private PetService petService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PetRepository petRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    //đặt lịch hẹn
    @PostMapping
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentRequest appointmentRequest) {
        Appointment appointment;
        
        // Kiểm tra xem có phải là cập nhật không (có ID được cung cấp)
        if (appointmentRequest.getId() != null) {
            try {
                // Lấy lịch hẹn hiện có để cập nhật
                appointment = appointmentService.getAppointment(appointmentRequest.getId());
            } catch (ResourceNotFoundException ex) {
                return ResponseEntity.notFound().build();
            }
            
            // Log để debug
            System.out.println("Đang cập nhật lịch hẹn ID: " + appointmentRequest.getId());
        } else {
            // Tạo mới lịch hẹn
            appointment = new Appointment();
            appointment.setStatus("Scheduled"); // Mặc định là đã lên lịch khi tạo mới
            
            // Log để debug
            System.out.println("Đang tạo lịch hẹn mới");
        }
        
        // Cập nhật thông tin lịch hẹn từ request
        appointment.setOwnerName(appointmentRequest.getOwnerName());
        appointment.setAppointmentDateTime(appointmentRequest.getAppointmentDateTime());
        appointment.setNickname(appointmentRequest.getNickname());
        appointment.setNotes(appointmentRequest.getNotes());
        
        // Nếu đang cập nhật, cập nhật cả trạng thái nếu có
        if (appointmentRequest.getId() != null && appointmentRequest.getStatus() != null) {
            appointment.setStatus(appointmentRequest.getStatus());
        }
        
        String username = appointmentRequest.getOwnerName();
        Optional<User> userOptional = userRepository.findByUsername(username);
        User owner = null;
        
        if (userOptional.isPresent()) {
            owner = userOptional.get();
            appointment.setCustomer(owner);
            
            // Xử lý thông tin pet
            if (appointmentRequest.getPetName() != null && !appointmentRequest.getPetName().isEmpty()) {
                List<Pet> userPets = petRepository.findByOwner(owner);
                Pet selectedPet = userPets.stream()
                        .filter(pet -> pet.getName().equals(appointmentRequest.getPetName()))
                        .findFirst()
                        .orElse(null);
                
                if (selectedPet == null) {
                    Pet newPet = new Pet();
                    newPet.setName(appointmentRequest.getPetName());
                    if (appointmentRequest.getPetAge() != null) {
                        LocalDate estimatedBirthDate = LocalDate.now().minusYears(appointmentRequest.getPetAge());
                        newPet.setBirthDate(estimatedBirthDate);
                    }
                    newPet.setOwner(owner);
                    selectedPet = petRepository.save(newPet);
                }
                
                appointment.setPet(selectedPet);
            }
        }

        // Xử lý thông tin bác sĩ
        if (appointmentRequest.getDoctorId() != null) {
            Doctor doctor = doctorService.getDoctorById(appointmentRequest.getDoctorId());
            appointment.setDoctor(doctor);
        }
        
        // Xử lý thông tin bác sĩ ưu tiên
        if (appointmentRequest.getPreferredDoctorId() != null) {
            Doctor preferredDoctor = doctorService.getDoctorById(appointmentRequest.getPreferredDoctorId());
            appointment.setPreferredDoctor(preferredDoctor);
        }

        // Lưu lịch hẹn (tạo mới hoặc cập nhật)
        Appointment savedAppointment = appointmentService.save(appointment);
        return ResponseEntity.ok(AppointmentDTO.fromEntity(savedAppointment));
    }

    //lấy lịch hẹn qua id
    @GetMapping("/get_appointment_by_id/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentsById(@PathVariable int id) {
        Appointment appointment = appointmentService.getAppointment(id);
        return ResponseEntity.ok(AppointmentDTO.fromEntity(appointment));
    }

    @GetMapping("/get_all_appointment")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        List<AppointmentDTO> appointmentDTOS = new ArrayList<>();
        for (Appointment appointment : appointments) {
            AppointmentDTO appointmentDTO = AppointmentDTO.fromEntity(appointment);
            appointmentDTOS.add(appointmentDTO);
        }
        return ResponseEntity.ok(appointmentDTOS);
    }

    @GetMapping("/get_appointment_by_name/{name}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByName(@PathVariable String name) {
        List<AppointmentDTO> appointments = appointmentService.getAllAppointmentsByName(name);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/get_appointment_by_date/{date}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDate(@PathVariable String date) {
        // API này hỗ trợ các định dạng ngày:
        // - MM/dd/yyyy (VD: 07/22/2024)
        // - yyyy-MM-dd (VD: 2024-07-22)
        List<AppointmentDTO> appointments = appointmentService.getAllAppointmentsByDate(date);
        return ResponseEntity.ok(appointments);
    }

    //check in
    @PutMapping("/check_in/{id}")
    public ResponseEntity<String> checkInAppointment(@PathVariable int id) {
        try {
            appointmentService.checkInAppointment(id);
            return ResponseEntity.ok("Khách hàng đã check-in thành công cho cuộc hẹn với ID: " + id);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    //bác sĩ lấy hồ sơ
    @GetMapping("/get_appointment_for_doctor/{id}")
    public ResponseEntity<AppointmentDTO> getNextAppointmentForDoctor(@PathVariable int id) {
        try {
            Appointment appointment = appointmentService.getNextAppointmentForDoctor(id);
            AppointmentDTO appointmentDTO = AppointmentDTO.fromEntity(appointment);
            return ResponseEntity.ok(appointmentDTO);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    //Bác sĩ hoàn thành hồ sơ
    @PutMapping("/commpleted_appointment/{id}")
    public ResponseEntity<String> completeAppointment(@PathVariable int id) {
        try {
            appointmentService.completeAppointment(id);
            return ResponseEntity.ok("Hồ sơ đã được hoàn tất thành công.");
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @GetMapping("/get_all_appointment_commpleted")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointmentsCommpleted() {
        List<Appointment> appointments = appointmentService.getAllAppointmentsCompleted();
        List<AppointmentDTO> appointmentDTOS = new ArrayList<>();
        for (Appointment appointment : appointments) {
            AppointmentDTO appointmentDTO = AppointmentDTO.fromEntity(appointment);
            appointmentDTOS.add(appointmentDTO);
        }
        return ResponseEntity.ok(appointmentDTOS);
    }

    //hủy check-in
    @PutMapping("/cancel_check_in/{id}")
    public ResponseEntity<String> cancelCheckInAppointment(@PathVariable int id) {
        try {
            appointmentService.cancelCheckInAppointment(id);
            return ResponseEntity.ok("Đã hủy check-in thành công cho cuộc hẹn với ID: " + id);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
    
    // Lấy danh sách cuộc hẹn theo username
    @GetMapping("/user/{username}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByUsername(@PathVariable String username) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = userOptional.get();
            
            // Lấy danh sách pet của user này
            List<Pet> userPets = petRepository.findByOwner(user);
            System.out.println("Tìm thấy " + userPets.size() + " thú cưng cho user: " + username);
            
            // Lấy danh sách lịch hẹn
            List<Appointment> appointments = appointmentService.getAllAppointmentsByUser(user);
            
            // Ghi log để debug
            System.out.println("Số lượng lịch hẹn tìm thấy: " + appointments.size());
            for (Appointment appointment : appointments) {
                System.out.println("Appointment ID: " + appointment.getId());
                
                // Gán thú cưng nếu chưa có
                if (appointment.getPet() == null && !userPets.isEmpty()) {
                    appointment.setPet(userPets.get(0));
                    System.out.println("  Đã gán pet " + userPets.get(0).getName() + " cho lịch hẹn ID " + appointment.getId());
                    appointmentService.save(appointment);
                }
                
                if (appointment.getPet() != null) {
                    System.out.println("  Pet ID: " + appointment.getPet().getId());
                    System.out.println("  Pet Name: " + appointment.getPet().getName());
                } else {
                    System.out.println("  Pet: null");
                }
            }
            
            // Chuyển đổi thành DTO và trả về
            List<AppointmentDTO> appointmentDTOS = appointments.stream()
                .map(AppointmentDTO::fromEntity)
                .toList();
            return ResponseEntity.ok(appointmentDTOS);
        } catch (Exception e) {
            System.out.println("Lỗi khi lấy danh sách lịch hẹn: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Lấy danh sách cuộc hẹn theo pet
    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByPet(@PathVariable Integer petId) {
        Pet pet = petService.getPetById(petId);
        List<Appointment> appointments = appointmentService.getAllAppointmentsByPet(pet);
        List<AppointmentDTO> appointmentDTOs = new ArrayList<>();
        
        for (Appointment appointment : appointments) {
            appointmentDTOs.add(AppointmentDTO.fromEntity(appointment));
        }
        
        return ResponseEntity.ok(appointmentDTOs);
    }
    
    // Hủy lịch hẹn
    @PutMapping("/cancel/{id}")
    public ResponseEntity<AppointmentDTO> cancelAppointment(@PathVariable Integer id) {
        try {
            Appointment appointment = appointmentService.cancelAppointment(id);
            if ("Cancelled".equals(appointment.getStatus())) {
                return ResponseEntity.ok(AppointmentDTO.fromEntity(appointment));
            }
            return ResponseEntity.ok(AppointmentDTO.fromEntity(appointment));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/update-pet-references")
    public ResponseEntity<String> updatePetReferences() {
        try {
            System.out.println("Đang gọi API cập nhật pet references");
            appointmentService.setPetForAppointments();
            return ResponseEntity.ok("Đã cập nhật thông tin pet cho các lịch hẹn");
        } catch (Exception e) {
            System.out.println("Lỗi khi cập nhật pet references: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi khi cập nhật: " + e.getMessage());
        }
    }
    
    // API cập nhật lịch hẹn (thật sự cập nhật chứ không tạo mới)
    @PutMapping("/update/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Integer id, @RequestBody AppointmentRequest appointmentRequest) {
        try {
            // Tạo đối tượng appointment từ request
            Appointment appointment = new Appointment();
            appointment.setOwnerName(appointmentRequest.getOwnerName());
            appointment.setAppointmentDateTime(appointmentRequest.getAppointmentDateTime());
            appointment.setNickname(appointmentRequest.getNickname());
            appointment.setNotes(appointmentRequest.getNotes());
            appointment.setStatus(appointmentRequest.getStatus());
            
            // Xử lý thông tin pet
            if (appointmentRequest.getPetName() != null && !appointmentRequest.getPetName().isEmpty()) {
                String username = appointmentRequest.getOwnerName();
                Optional<User> userOptional = userRepository.findByUsername(username);
                
                if (userOptional.isPresent()) {
                    User owner = userOptional.get();
                    appointment.setCustomer(owner);
                    
                    List<Pet> userPets = petRepository.findByOwner(owner);
                    Pet selectedPet = userPets.stream()
                            .filter(pet -> pet.getName().equals(appointmentRequest.getPetName()))
                            .findFirst()
                            .orElse(null);
                    
                    if (selectedPet == null) {
                        Pet newPet = new Pet();
                        newPet.setName(appointmentRequest.getPetName());
                        if (appointmentRequest.getPetAge() != null) {
                            LocalDate estimatedBirthDate = LocalDate.now().minusYears(appointmentRequest.getPetAge());
                            newPet.setBirthDate(estimatedBirthDate);
                        }
                        newPet.setOwner(owner);
                        selectedPet = petRepository.save(newPet);
                    }
                    
                    appointment.setPet(selectedPet);
                }
            }
            
            // Xử lý thông tin bác sĩ
            if (appointmentRequest.getDoctorId() != null) {
                Doctor doctor = doctorService.getDoctorById(appointmentRequest.getDoctorId());
                appointment.setDoctor(doctor);
            }
            
            // Xử lý thông tin bác sĩ ưu tiên
            if (appointmentRequest.getPreferredDoctorId() != null) {
                Doctor preferredDoctor = doctorService.getDoctorById(appointmentRequest.getPreferredDoctorId());
                appointment.setPreferredDoctor(preferredDoctor);
            }
            
            // Cập nhật lịch hẹn
            Appointment updatedAppointment = appointmentService.updateAppointment(id, appointment);
            return ResponseEntity.ok(AppointmentDTO.fromEntity(updatedAppointment));
            
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            System.out.println("Lỗi khi cập nhật lịch hẹn: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    // API xóa hoàn toàn lịch hẹn khỏi database
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAppointment(@PathVariable Integer id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok("Đã xóa lịch hẹn thành công");
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy lịch hẹn: " + ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa lịch hẹn: " + ex.getMessage());
        }
    }
}

