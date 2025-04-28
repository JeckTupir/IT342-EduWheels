package com.example.eduwheels.Controller;

import com.example.eduwheels.Entity.BookingEntity;
import com.example.eduwheels.Service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BookingEntity> createBooking(@RequestBody BookingRequest bookingRequest) {
        BookingEntity createdBooking = bookingService.createBooking(bookingRequest);
        return new ResponseEntity<>(createdBooking, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingEntity> updateBooking(@PathVariable Long id, @RequestBody BookingEntity updatedBooking) {
        BookingEntity booking = bookingService.updateBooking(id, updatedBooking);
        if (booking != null) {
            return ResponseEntity.ok(booking);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    // --- New Endpoint to Get Bookings for the Current User ---
    @GetMapping("/my") // Or /user/me, or similar, but /my is common
    public ResponseEntity<List<BookingEntity>> getMyBookings() {
        try {
            List<BookingEntity> myBookings = bookingService.getBookingsForCurrentUser();
            return ResponseEntity.ok(myBookings);
        } catch (IllegalStateException e) {
            // Handle case where user is not authenticated (though typically handled by Security config)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Or an error response body
        } catch (RuntimeException e) {
            // Handle case where authenticated user is not found in DB
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // Or an error response body
        }
    }

    // 🧹 Cleaner Request DTO
    public static class BookingRequest {
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private int numberOfPassengers;
        private String status;
        private String plateNumber;
        private Integer vehicleAvailableSeats;
        private String pickUp;
        private String dropOff;

        // Getters and Setters
        public LocalDateTime getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDateTime startDate) {
            this.startDate = startDate;
        }

        public LocalDateTime getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDateTime endDate) {
            this.endDate = endDate;
        }

        public int getNumberOfPassengers() {
            return numberOfPassengers;
        }

        public void setNumberOfPassengers(int numberOfPassengers) {
            this.numberOfPassengers = numberOfPassengers;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getPlateNumber() {
            return plateNumber;
        }

        public void setPlateNumber(String plateNumber) {
            this.plateNumber = plateNumber;
        }

        public Integer getVehicleAvailableSeats() {
            return vehicleAvailableSeats;
        }

        public void setVehicleAvailableSeats(Integer vehicleAvailableSeats) {
            this.vehicleAvailableSeats = vehicleAvailableSeats;
        }

        public String getPickUp() { return pickUp; }

        public void setPickUp(String pickUp) { this.pickUp = pickUp; }

        public String getDropOff() { return dropOff; }

        public void setDropOff(String dropOff) { this.dropOff = dropOff; }
    }
}
