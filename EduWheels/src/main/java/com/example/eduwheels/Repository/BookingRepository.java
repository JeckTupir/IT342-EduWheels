package com.example.eduwheels.Repository;

import com.example.eduwheels.Entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.eduwheels.Entity.UserEntity;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    List<BookingEntity> findByUser(UserEntity user);
}
