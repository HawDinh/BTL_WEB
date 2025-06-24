package com.example.BTL_Nhom7_OOP.service;

import com.example.BTL_Nhom7_OOP.dto.response.AppointmentDTO;
import com.example.BTL_Nhom7_OOP.entity.Appointment;
import com.example.BTL_Nhom7_OOP.entity.Doctor;
import com.example.BTL_Nhom7_OOP.entity.Pet;
import com.example.BTL_Nhom7_OOP.entity.User;
import com.example.BTL_Nhom7_OOP.exception.ResourceNotFoundException;
import com.example.BTL_Nhom7_OOP.repository.AppointmentRepository;
import com.example.BTL_Nhom7_OOP.repository.PetRepository;
import com.example.BTL_Nhom7_OOP.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class AppointmentService {
    private final Queue<Integer> appointmentQueue = new LinkedList<>();

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    //đặt lịch hẹn
    public Appointment createAppointment(Appointment appointment) {
        appointment.setStatus("Scheduled");
        return appointmentRepository.save(appointment);
    }

    //Tìm lịch theo id
    public Appointment getAppointment(int id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không thấy lịch đặt"));
    }

    //lấy danh sách các cuộc hẹn đã đặt
    public List<Appointment> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        if (appointments.isEmpty()) {
            throw new RuntimeException("Không tìm thấy lịch đặt");
        }
        return appointments;
    }

    //lấy danh sách các cuộc hẹn đã đặt theo tên
    public List<AppointmentDTO> getAllAppointmentsByName(String name) {
        List<Appointment> appointments = appointmentRepository.findAllByOwnerName(name);
        if (appointments.isEmpty()) {
            throw new RuntimeException("Không tìm thấy lịch đặt");
        }
        return appointments.stream().map(AppointmentDTO::fromEntity).collect(Collectors.toList());
    }

    //lấy danh sách các cuộc hẹn đã đặt theo ngày
    public List<AppointmentDTO> getAllAppointmentsByDate(String date) {
        try {
            LocalDateTime startOfDay;
            LocalDateTime endOfDay;
            
            // Nếu date null thì lấy ngày hiện tại
            if (date == null) {
                startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
                endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
            } else {
                // Xử lý các định dạng ngày khác nhau
                LocalDate parsedDate;
                
                // Thử xử lý định dạng MM/dd/yyyy (07/22/2024)
                if (date.contains("/")) {
                    String[] parts = date.split("/");
                    if (parts.length == 3) {
                        int month = Integer.parseInt(parts[0]);
                        int day = Integer.parseInt(parts[1]);
                        int year = Integer.parseInt(parts[2]);
                        parsedDate = LocalDate.of(year, month, day);
                    } else {
                        throw new IllegalArgumentException("Invalid date format");
                    }
                }
                // Thử xử lý định dạng yyyy-MM-dd (2024-07-22)
                else if (date.contains("-")) {
                    parsedDate = LocalDate.parse(date);
                } else {
                    throw new IllegalArgumentException("Invalid date format");
                }
                
                // Tạo khoảng thời gian từ đầu ngày đến cuối ngày
                startOfDay = parsedDate.atStartOfDay();
                endOfDay = parsedDate.atTime(23, 59, 59);
            }
            
            // Lấy tất cả cuộc hẹn trong ngày đó
            List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(appointment -> {
                    LocalDateTime appointmentDateTime = appointment.getAppointmentDateTime();
                    return appointmentDateTime != null && 
                           !appointmentDateTime.isBefore(startOfDay) && 
                           !appointmentDateTime.isAfter(endOfDay);
                })
                .toList();
            
            return appointments.stream().map(AppointmentDTO::fromEntity).collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("Error parsing date: " + e.getMessage());
            return List.of(); // Trả về danh sách trống nếu có lỗi
        }
    }

    //lễ tân check in
    public Appointment checkInAppointment(int appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));

        // Kiểm tra trạng thái cuộc hẹn
        if ("Checked In".equals(appointment.getStatus())) {
            throw new IllegalStateException("Cuộc hẹn đã được check-in trước đó.");
        }

        // Cập nhật trạng thái thành "Checked In"
        appointment.setStatus("Checked In");
        return appointmentRepository.save(appointment);
    }

    // Nạp các hồ sơ "Checked In" vào hàng đợi
    public void loadAppointmentsToQueue() {
        List<Appointment> appointments = appointmentRepository.findAllByStatus("Checked In");
        for (Appointment appointment : appointments) {
            appointmentQueue.add(appointment.getId());
        }
    }

    // Lấy hồ sơ tiếp theo cho bác sĩ từ hàng đợi
    public Appointment getNextAppointmentForDoctor(int doctorId) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        if (!"Free".equals(doctor.getStatus())) {
            throw new ResourceNotFoundException("Không có bác sĩ nào rảnh");
        }
        loadAppointmentsToQueue();
        Integer appointmentId = appointmentQueue.poll(); // Lấy ID đầu tiên trong hàng đợi
        if (appointmentId == null) {
            throw new IllegalStateException("Không có hồ sơ nào đang chờ.");
        }

        // Lấy thông tin hồ sơ từ DB
        Appointment appointment = getAppointment(appointmentId);

        // Cập nhật trạng thái và gắn bác sĩ xử lý
        appointment.setStatus("In Progress");
        doctor.setStatus("Busy");
        appointment.setDoctor(doctor);
        return appointmentRepository.save(appointment);
    }

    // Khi bác sĩ hoàn thành xử lý
    public void completeAppointment(int appointmentId) {
        Appointment appointment = getAppointment(appointmentId);
        appointment.setStatus("Completed");
        Doctor doctor = doctorService.getDoctorById(appointment.getDoctor().getId());
        doctor.setStatus("Free");
        appointmentRepository.save(appointment);
    }

    //Lấy danh sách tất cả các cuộc hẹn đã hoàn thành thăm khám
    public List<Appointment> getAllAppointmentsCompleted() {
        return appointmentRepository.findAllByStatus("Completed");
    }

    //hủy check-in
    public Appointment cancelCheckInAppointment(int appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));

        // Kiểm tra trạng thái cuộc hẹn
        if (!"Checked In".equals(appointment.getStatus())) {
            throw new IllegalStateException("Cuộc hẹn chưa được check-in hoặc đã trong trạng thái khác.");
        }

        // Cập nhật trạng thái về "Scheduled"
        appointment.setStatus("Scheduled");
        return appointmentRepository.save(appointment);
    }
    
    // Lấy danh sách cuộc hẹn theo User (khách hàng)
    public List<Appointment> getAllAppointmentsByUser(User user) {
        List<Appointment> appointments = appointmentRepository.findByCustomer(user);
        
        // Ghi log thông tin lịch hẹn
        System.out.println("Tìm thấy " + appointments.size() + " lịch hẹn cho user: " + user.getUsername());
        for (Appointment appointment : appointments) {
            System.out.println("Appointment ID: " + appointment.getId());
            System.out.println("  Status: " + appointment.getStatus());
            System.out.println("  Date: " + appointment.getAppointmentDateTime());
            
            if (appointment.getPet() != null) {
                System.out.println("  Pet ID: " + appointment.getPet().getId());
                System.out.println("  Pet Name: " + appointment.getPet().getName());
                System.out.println("  Pet Birth Date: " + appointment.getPet().getBirthDate());
                
                // Thử gán pet cho lịch hẹn này nếu chưa có
                if (appointment.getPet() != null) {
                    System.out.println("  Đã có pet cho lịch hẹn này: " + appointment.getPet().getName());
                }
            } else {
                System.out.println("  Pet: null");
                
                // Thử tìm pet cho user này và gán cho lịch hẹn
                List<Pet> userPets = petRepository.findByOwner(user);
                if (!userPets.isEmpty()) {
                    Pet pet = userPets.get(0);
                    appointment.setPet(pet);
                    System.out.println("  Đã gán pet " + pet.getName() + " cho lịch hẹn ID " + appointment.getId());
                    appointmentRepository.save(appointment);
                }
            }
        }
        
        return appointments;
    }
    
    // Lấy danh sách cuộc hẹn theo Pet (thú cưng)
    public List<Appointment> getAllAppointmentsByPet(Pet pet) {
        return appointmentRepository.findByPet(pet);
    }
    
    // Lưu lịch hẹn
    public Appointment save(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }
    
    // Cập nhật lịch hẹn
    public Appointment updateAppointment(Integer id, Appointment updatedAppointment) {
        Appointment existingAppointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + id));
        
        // Cập nhật thông tin
        existingAppointment.setOwnerName(updatedAppointment.getOwnerName());
        existingAppointment.setAppointmentDateTime(updatedAppointment.getAppointmentDateTime());
        existingAppointment.setNickname(updatedAppointment.getNickname());
        existingAppointment.setNotes(updatedAppointment.getNotes());
        existingAppointment.setStatus(updatedAppointment.getStatus());
        existingAppointment.setPet(updatedAppointment.getPet());
        existingAppointment.setDoctor(updatedAppointment.getDoctor());
        existingAppointment.setPreferredDoctor(updatedAppointment.getPreferredDoctor());
        existingAppointment.setCustomer(updatedAppointment.getCustomer());
        
        return appointmentRepository.save(existingAppointment);
    }
    
    // Xóa lịch hẹn (hoàn toàn)
    public void deleteAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + id));
        
        // Xóa hoàn toàn khỏi database
        appointmentRepository.delete(appointment);
    }
    
    // Hủy lịch hẹn
    public Appointment cancelAppointment(int appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));

        // Nếu đã ở trạng thái Cancelled rồi thì trả về luôn
        if ("Cancelled".equals(appointment.getStatus())) {
            return appointment; // Đã hủy trước đó
        }
        
        // Kiểm tra trạng thái cuộc hẹn
        if (!"Scheduled".equals(appointment.getStatus())) {
            throw new IllegalStateException("Chỉ có thể hủy lịch hẹn có trạng thái 'Đã lên lịch'.");
        }

        // Cập nhật trạng thái thành "Cancelled"
        appointment.setStatus("Cancelled");
        return appointmentRepository.save(appointment);
    }

    // Gán pet cho các lịch hẹn dựa trên ownerName và petName
    public void setPetForAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        System.out.println("Đang cập nhật pet cho " + appointments.size() + " lịch hẹn");
        
        for (Appointment appointment : appointments) {
            if (appointment.getPet() == null && appointment.getOwnerName() != null) {
                Optional<User> userOpt = userRepository.findByUsername(appointment.getOwnerName());
                
                if (userOpt.isPresent()) {
                    User owner = userOpt.get();
                    List<Pet> userPets = petRepository.findByOwner(owner);
                    
                    if (!userPets.isEmpty()) {
                        // Nếu chỉ có 1 pet, gán mặc định
                        appointment.setPet(userPets.get(0));
                        System.out.println("Đã gán pet " + userPets.get(0).getName() + " cho lịch hẹn ID " + appointment.getId());
                        appointmentRepository.save(appointment);
                    }
                }
            }
        }
    }
}
