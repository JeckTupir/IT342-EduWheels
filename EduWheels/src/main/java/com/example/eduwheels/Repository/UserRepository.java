package com.example.eduwheels.Repository; // ✅ Ensure package name is lowercase

import com.example.eduwheels.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    // ✅ Find user by schoolid
    Optional<UserEntity> findBySchoolid(String schoolid);
    Optional<UserEntity> findByEmail(String email);


}