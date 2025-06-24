package com.example.BTL_Nhom7_OOP.dto.response;

import com.example.BTL_Nhom7_OOP.entity.Pet;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PetDTO {
    private static final Logger logger = LoggerFactory.getLogger(PetDTO.class);
    
    private Integer id;
    private String name;
    private String species;
    private String breed;
    private String color;
    private LocalDate birthDate;
    private String gender;
    private String description;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String ownerUsername;

    public PetDTO() {
    }

    public PetDTO(Integer id, String name, String species, String breed, String color, 
                 LocalDate birthDate, String gender, String description, 
                 LocalDate createdAt, LocalDate updatedAt, String ownerUsername) {
        this.id = id;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.color = color;
        this.birthDate = birthDate;
        this.gender = gender;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ownerUsername = ownerUsername;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDate updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public static PetDTO fromEntity(Pet pet) {
        try {
            if (pet == null) {
                logger.warn("Trying to convert null Pet to PetDTO");
                return null;
            }
            
            String ownerUsername = null;
            
            // Kiểm tra kỹ hơn về thông tin chủ sở hữu
            if (pet.getOwner() != null) {
                try {
                    ownerUsername = pet.getOwner().getUsername();
                } catch (Exception e) {
                    logger.error("Error getting username from owner for pet id: {}", pet.getId(), e);
                    // Không throw exception, chỉ để ownerUsername = null
                }
            }
            
            return new PetDTO(
                pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getBreed(),
                pet.getColor(),
                pet.getBirthDate(),
                pet.getGender(),
                pet.getDescription(),
                pet.getCreatedAt(),
                pet.getUpdatedAt(),
                ownerUsername
            );
        } catch (Exception e) {
            logger.error("Error converting Pet to PetDTO: {}", e.getMessage(), e);
            throw e; // Để controller có thể bắt và xử lý
        }
    }
} 