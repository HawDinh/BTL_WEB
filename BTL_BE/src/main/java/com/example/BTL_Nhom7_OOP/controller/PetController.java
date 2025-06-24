package com.example.BTL_Nhom7_OOP.controller;

import com.example.BTL_Nhom7_OOP.dto.request.PetRequest;
import com.example.BTL_Nhom7_OOP.dto.response.PetDTO;
import com.example.BTL_Nhom7_OOP.entity.Pet;
import com.example.BTL_Nhom7_OOP.entity.User;
import com.example.BTL_Nhom7_OOP.exception.AppException;
import com.example.BTL_Nhom7_OOP.exception.ErrorCode;
import com.example.BTL_Nhom7_OOP.repository.UserRepository;
import com.example.BTL_Nhom7_OOP.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:5500", "http://localhost:5501"}, allowCredentials = "true")
public class PetController {
    private static final Logger logger = LoggerFactory.getLogger(PetController.class);
    
    @Autowired
    private PetService petService;

    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/count")
    public long countPets() {
        return petService.getAllPets().size();
    }
    
    @GetMapping
    public ResponseEntity<List<PetDTO>> getAllPets() {
        try {
            logger.info("Đang lấy danh sách tất cả thú cưng");
            List<Pet> pets = petService.getAllPets();
            logger.info("Đã lấy được {} thú cưng từ DB", pets.size());
            
            List<PetDTO> petDTOs = new ArrayList<>();
            
            // Xử lý từng pet một cách riêng biệt để tránh lỗi cả danh sách
            for (Pet pet : pets) {
                try {
                    PetDTO dto = PetDTO.fromEntity(pet);
                    if (dto != null) {
                        petDTOs.add(dto);
                    }
                } catch (Exception e) {
                    logger.error("Lỗi khi chuyển đổi pet ID: {} sang DTO", pet.getId(), e);
                    // Bỏ qua pet này và tiếp tục với pet khác
                }
            }
            
            logger.info("Trả về {} thú cưng DTO", petDTOs.size());
            return ResponseEntity.ok(petDTOs);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy tất cả thú cưng: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Integer id) {
        try {
            logger.info("Đang lấy thú cưng với ID: {}", id);
            Pet pet = petService.getPetById(id);
            PetDTO petDTO = PetDTO.fromEntity(pet);
            return ResponseEntity.ok(petDTO);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thú cưng theo ID {}: {}", id, e.getMessage(), e);
            throw new AppException(ErrorCode.PET_NOT_FOUND);
        }
    }
    
    @GetMapping("/owner/{username}")
    public ResponseEntity<List<PetDTO>> getPetsByOwner(@PathVariable String username) {
        try {
            // Decode URL để xử lý các ký tự đặc biệt trong username
            String decodedUsername = URLDecoder.decode(username, StandardCharsets.UTF_8.name());
            logger.info("Tìm thú cưng cho username (đã decode): {}", decodedUsername);
            
            List<Pet> pets = petService.getPetsByUsername(decodedUsername);
            
            List<PetDTO> petDTOs = new ArrayList<>();
            // Xử lý từng pet một cách riêng biệt
            for (Pet pet : pets) {
                try {
                    PetDTO dto = PetDTO.fromEntity(pet);
                    if (dto != null) {
                        petDTOs.add(dto);
                    }
                } catch (Exception e) {
                    logger.error("Lỗi khi chuyển đổi pet ID: {} sang DTO", pet.getId(), e);
                    // Bỏ qua pet này và tiếp tục với pet khác
                }
            }
            
            logger.info("Đã tìm thấy {} thú cưng cho username: {}", petDTOs.size(), decodedUsername);
            return ResponseEntity.ok(petDTOs);
        } catch (UnsupportedEncodingException e) {
            logger.error("Lỗi khi decode username: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        } catch (AppException e) {
            logger.error("AppException khi tìm thú cưng: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi tìm thú cưng: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<PetDTO>> searchPets(@RequestParam String keyword) {
        try {
            logger.info("Tìm kiếm thú cưng với từ khóa: {}", keyword);
            List<Pet> pets = petService.searchPets(keyword);
            
            List<PetDTO> petDTOs = new ArrayList<>();
            for (Pet pet : pets) {
                try {
                    PetDTO dto = PetDTO.fromEntity(pet);
                    if (dto != null) {
                        petDTOs.add(dto);
                    }
                } catch (Exception e) {
                    logger.error("Lỗi khi chuyển đổi pet ID: {} sang DTO", pet.getId(), e);
                }
            }
            
            return ResponseEntity.ok(petDTOs);
        } catch (Exception e) {
            logger.error("Lỗi khi tìm kiếm thú cưng với từ khóa {}: {}", keyword, e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); 
        }
    }
    
    @PostMapping
    public ResponseEntity<PetDTO> createPet(@RequestBody PetRequest petRequest) {
        try {
            logger.info("Đang tạo thú cưng mới với tên: {}", petRequest.getName());
            
            Pet pet = new Pet();
            pet.setName(petRequest.getName());
            pet.setSpecies(petRequest.getSpecies());
            pet.setBreed(petRequest.getBreed());
            pet.setColor(petRequest.getColor());
            pet.setBirthDate(petRequest.getBirthDate());
            pet.setGender(petRequest.getGender());
            pet.setDescription(petRequest.getDescription());

            String username = petRequest.getOwnerUsername();
            if (username != null) {
                logger.info("Đang thiết lập chủ sở hữu với username: {}", username);
                Optional<User> userOptional = userRepository.findByUsername(username);
                if (!userOptional.isPresent()) {
                    logger.error("Không tìm thấy người dùng với username: {}", username);
                    throw new AppException(ErrorCode.USER_NOT_FOUND);
                }
                pet.setOwner(userOptional.get());
            }

            Pet savedPet = petService.createPet(pet);
            logger.info("Đã tạo thành công thú cưng với ID: {}", savedPet.getId());
            return ResponseEntity.ok(PetDTO.fromEntity(savedPet));
        } catch (AppException e) {
            logger.error("AppException khi tạo thú cưng: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi tạo thú cưng: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PetDTO> updatePet(@PathVariable Integer id, @RequestBody PetRequest petRequest) {
        try {
            logger.info("Đang cập nhật thú cưng với ID: {}", id);
            
            Pet petDetails = new Pet();
            petDetails.setName(petRequest.getName());
            petDetails.setSpecies(petRequest.getSpecies());
            petDetails.setBreed(petRequest.getBreed());
            petDetails.setColor(petRequest.getColor());
            petDetails.setBirthDate(petRequest.getBirthDate());
            petDetails.setGender(petRequest.getGender());
            petDetails.setDescription(petRequest.getDescription());

            Pet updatedPet = petService.updatePet(id, petDetails);
            logger.info("Đã cập nhật thành công thú cưng với ID: {}", updatedPet.getId());
            return ResponseEntity.ok(PetDTO.fromEntity(updatedPet));
        } catch (AppException e) {
            logger.error("AppException khi cập nhật thú cưng ID {}: {}", id, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi cập nhật thú cưng ID {}: {}", id, e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Integer id) {
        try {
            logger.info("Đang xóa thú cưng với ID: {}", id);
            petService.deletePet(id);
            logger.info("Đã xóa thành công thú cưng với ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (AppException e) {
            logger.error("AppException khi xóa thú cưng ID {}: {}", id, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi xóa thú cưng ID {}: {}", id, e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
} 