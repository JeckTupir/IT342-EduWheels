package com.example.eduwheels.Controller;

import com.example.eduwheels.Entity.BookingEntity;
import com.example.eduwheels.Entity.ReportEntity;
import com.example.eduwheels.Entity.UserEntity;
import com.example.eduwheels.Service.BookingService;
import com.example.eduwheels.Service.ReportService;
import com.example.eduwheels.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Autowired
    private UserService userService;

    @GetMapping
    public List<ReportEntity> getAllReviews() {
        return reportService.getAllReports();
    }

    @GetMapping("/{id}")
    public Optional<ReportEntity> getReviewById(@PathVariable Integer id) {
        return reportService.getReportById(id);
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReportEntity review) {
        // Get the currently logged-in user's email from the Authentication object
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // The principal name is now the email

        Optional<UserEntity> currentUserOptional = userService.findByEmail(email);

        if (!currentUserOptional.isPresent()) {
            return new ResponseEntity<>("User not found with email.", HttpStatus.UNAUTHORIZED);
        }
        UserEntity currentUser = currentUserOptional.get();
        review.setUser(currentUser); // Set the user who created the review

        // Fetch the booking and validate
        BookingEntity booking = review.getBooking();

        if (booking == null || booking.getBookingID() == null) {
            return new ResponseEntity<>("Booking ID is required for a review.", HttpStatus.BAD_REQUEST);
        }

        Optional<BookingEntity> existingBookingOptional = bookingService.getBookingById(booking.getBookingID());
        if (!existingBookingOptional.isPresent()) {
            return new ResponseEntity<>("Booking not found.", HttpStatus.NOT_FOUND);
        }
        BookingEntity existingBooking = existingBookingOptional.get();

        if (existingBooking.getStatus() != BookingEntity.Status.Done) {
            return new ResponseEntity<>("Cannot review a booking that is not marked as Done.", HttpStatus.BAD_REQUEST);
        }

        // Check if a review already exists for this booking
        if (reportService.existsByBooking(existingBooking)) {
            return new ResponseEntity<>("A review already exists for this booking.", HttpStatus.CONFLICT);
        }

        review.setReviewDate(LocalDateTime.now());
        review.setBooking(existingBooking); // ensure reference is correct

        ReportEntity createdReview = reportService.createReport(review);
        return new ResponseEntity<>(createdReview, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Integer id, @RequestBody ReportEntity updatedReview) {
        Optional<ReportEntity> existingReviewOptional = reportService.getReportById(id);
        if (!existingReviewOptional.isPresent()) {
            return new ResponseEntity<>("Review not found.", HttpStatus.NOT_FOUND);
        }

        ReportEntity existingReview = existingReviewOptional.get();

        // Only allow updating rating and comment for now
        existingReview.setRating(updatedReview.getRating());
        existingReview.setComment(updatedReview.getComment());

        ReportEntity savedReview = reportService.updateReport(existingReview);
        return new ResponseEntity<>(savedReview, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Integer id) {
        Optional<ReportEntity> reviewOptional = reportService.getReportById(id);
        if (!reviewOptional.isPresent()) {
            return new ResponseEntity<>("Review not found.", HttpStatus.NOT_FOUND);
        }

        // No authorization check for admin deletion for simplicity in this example
        // In a real application, you would likely have admin role checks here.

        reportService.deleteReport(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // New endpoint to check if a review exists for a booking
    @GetMapping("/booking/{bookingId}/exists")
    public ResponseEntity<Boolean> checkIfReviewExistsForBooking(@PathVariable Long bookingId) {
        Optional<BookingEntity> bookingOptional = bookingService.getBookingById(bookingId);
        if (!bookingOptional.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(reportService.existsByBooking(bookingOptional.get()), HttpStatus.OK);
    }
}