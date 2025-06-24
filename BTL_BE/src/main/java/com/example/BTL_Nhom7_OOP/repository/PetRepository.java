package com.example.BTL_Nhom7_OOP.repository;

import com.example.BTL_Nhom7_OOP.entity.Pet;
import com.example.BTL_Nhom7_OOP.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Integer> {
    List<Pet> findByOwner(User owner);
    List<Pet> findByName(String name);
    List<Pet> findBySpecies(String species);
    List<Pet> findByNameContaining(String keyword);
    
    // Tìm thú cưng bằng ID của chủ sở hữu
    @Query("SELECT p FROM Pet p WHERE p.owner.id = :ownerId")
    List<Pet> findByOwnerId(@Param("ownerId") String ownerId);
} 