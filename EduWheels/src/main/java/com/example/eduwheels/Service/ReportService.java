package com.example.eduwheels.Service;

import com.example.eduwheels.Entity.ReportEntity;
import com.example.eduwheels.Repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    @Autowired
    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    // Get all reviews
    public List<ReportEntity> getAllReports() {
        return reportRepository.findAll();
    }

    // Get review by ID
    public Optional<ReportEntity> getReportById(Integer reportId) {
        return reportRepository.findById(reportId);
    }

    // Create or update a review
    public ReportEntity createReport(ReportEntity report) {
        return reportRepository.save(report);
    }

    // Delete review by ID
    public void deleteReport(Integer reportId) {
        reportRepository.deleteById(reportId);
    }

    // Get all reviews for a specific vehicle
    public List<ReportEntity> getReviewsByVehicleId(Long vehicleId) {
        return reportRepository.findByBookingVehicleVehicleId(vehicleId);
    }

    // Get all reviews made by a specific user
    public List<ReportEntity> getReviewsByUserId(Long userid) {
        return reportRepository.findByUserUserid(userid);
    }

    // Optional: Get review by booking ID (to prevent duplicate reviews)
    public Optional<ReportEntity> getReviewByBookingId(Long bookingId) {
        return reportRepository.findByBookingBookingID(bookingId);
    }
}
