package com.example.BTL_Nhom7_OOP.service;

import com.example.BTL_Nhom7_OOP.entity.Pet;
import com.example.BTL_Nhom7_OOP.entity.User;
import com.example.BTL_Nhom7_OOP.exception.AppException;
import com.example.BTL_Nhom7_OOP.exception.ErrorCode;
import com.example.BTL_Nhom7_OOP.repository.PetRepository;
import com.example.BTL_Nhom7_OOP.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PetService {
    private static final Logger logger = LoggerFactory.getLogger(PetService.class);
    
    @Autowired
    private PetRepository petRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }
    
    public Pet getPetById(Integer id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));
    }
    
    public List<Pet> getPetsByOwner(User owner) {
        return petRepository.findByOwner(owner);
    }
    
    public List<Pet> getPetsByUsername(String username) {
        logger.info("Tìm thú cưng cho người dùng có username: {}", username);
        
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (!userOptional.isPresent()) {
            logger.error("Không tìm thấy người dùng với username: {}", username);
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        
        User owner = userOptional.get();
        logger.info("Đã tìm thấy người dùng với ID: {}", owner.getId());
        
        List<Pet> pets = petRepository.findByOwnerId(owner.getId());
        logger.info("Số lượng thú cưng tìm thấy bằng phương thức findByOwnerId: {}", pets.size());
        
        if (pets.isEmpty()) {
            logger.info("Thử tìm thú cưng bằng phương thức findByOwner");
            pets = petRepository.findByOwner(owner);
            logger.info("Số lượng thú cưng tìm thấy bằng phương thức findByOwner: {}", pets.size());
        }
        
        return pets;
    }
    
    public Pet createPet(Pet pet) {
        return petRepository.save(pet);
    }
    
    public Pet updatePet(Integer id, Pet petDetails) {
        Pet pet = getPetById(id);
        
        if (petDetails.getName() != null) {
            pet.setName(petDetails.getName());
        }
        if (petDetails.getSpecies() != null) {
            pet.setSpecies(petDetails.getSpecies());
        }
        if (petDetails.getBreed() != null) {
            pet.setBreed(petDetails.getBreed());
        }
        if (petDetails.getColor() != null) {
            pet.setColor(petDetails.getColor());
        }
        if (petDetails.getBirthDate() != null) {
            pet.setBirthDate(petDetails.getBirthDate());
        }
        if (petDetails.getGender() != null) {
            pet.setGender(petDetails.getGender());
        }
        if (petDetails.getDescription() != null) {
            pet.setDescription(petDetails.getDescription());
        }
        
        return petRepository.save(pet);
    }
    
    public void deletePet(Integer id) {
        Pet pet = getPetById(id);
        petRepository.delete(pet);
    }
    
    public List<Pet> searchPets(String keyword) {
        return petRepository.findByNameContaining(keyword);
    }
} 