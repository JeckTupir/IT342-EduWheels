package com.example.eduwheels.Repository;

import com.example.eduwheels.Entity.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<ReportEntity, Integer> {

    List<ReportEntity> findByBookingVehicleVehicleId(Long vehicleId);

    List<ReportEntity> findByUserUserid(Long userid);

    Optional<ReportEntity> findByBookingBookingID(Long bookingId);
}
