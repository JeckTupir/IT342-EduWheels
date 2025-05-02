package com.example.eduwheels.Controller;

import com.example.eduwheels.Entity.BookingEntity;
import com.example.eduwheels.Entity.ReportEntity;
import com.example.eduwheels.Service.BookingService;
import com.example.eduwheels.Service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public List<ReportEntity> getAllReviews() {
        return reportService.getAllReports(); // still using same method for now
    }

    @GetMapping("/{id}")
    public Optional<ReportEntity> getReviewById(@PathVariable Integer id) {
        return reportService.getReportById(id);
    }

    @PostMapping
    public ReportEntity createReview(@RequestBody ReportEntity review) {
        // Fetch the booking and validate
        BookingEntity booking = review.getBooking();

        if (booking == null || booking.getBookingID() == null) {
            throw new IllegalArgumentException("Booking is required for a review.");
        }

        BookingEntity existingBooking = bookingService.getBookingById(booking.getBookingID())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found."));

        if (existingBooking.getStatus() != BookingEntity.Status.Done) {
            throw new IllegalStateException("Cannot review a booking that is not marked as Done.");
        }

        review.setReviewDate(LocalDateTime.now());
        review.setBooking(existingBooking); // ensure reference is correct

        return reportService.createReport(review);
    }

    @DeleteMapping("/{id}")
    public void deleteReview(@PathVariable Integer id) {
        reportService.deleteReport(id);
    }
}
