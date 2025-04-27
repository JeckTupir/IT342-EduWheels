package com.example.eduwheels.Service;

import com.example.eduwheels.Entity.BookingEntity;
import com.example.eduwheels.Entity.VehicleEntity;
import com.example.eduwheels.Entity.UserEntity; // <-- Import your User entity
import com.example.eduwheels.Repository.BookingRepository;
import com.example.eduwheels.Repository.VehicleRepository;
import com.example.eduwheels.Repository.UserRepository; // <-- Import your User repository
import com.example.eduwheels.Controller.BookingController.BookingRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder; // <-- Import SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails; // <-- Import UserDetails
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired // <-- Inject UserRepository
    private UserRepository userRepository;

    public List<BookingEntity> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<BookingEntity> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public BookingEntity createBooking(BookingRequest bookingRequest) {

        // --- Get the currently authenticated user ---
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User must be authenticated to create a booking.");
        }

        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        }
        else {
            throw new IllegalStateException("Could not determine username from authentication principal.");
        }

        // --- Fetch the User entity from the database ---
        // Assuming your User entity is UserEntity and has a findByUsername or findByEmail method
        System.out.println("Extracted username/email from security context: " + username);
// Log principal details if needed: System.out.println(principal);

        UserEntity currentUser = userRepository.findByEmail(username) // Or findByUsername
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + username));

// Log the fetched user's ID *immediately* after fetching
        System.out.println("Fetched UserEntity: ID = " + (currentUser != null ? currentUser.getUserid() : "null")); // Assuming getId() or getUserId() exists

        // --- Vehicle Logic (existing) ---
        if (bookingRequest.getPlateNumber() == null || bookingRequest.getPlateNumber().isEmpty()) {
            throw new IllegalArgumentException("Vehicle plate number is required for creating a booking.");
        }
        VehicleEntity vehicle = vehicleRepository.findByPlateNumber(bookingRequest.getPlateNumber())
                .orElseGet(() -> {
                    // ... (rest of vehicle creation logic remains the same)
                    if (bookingRequest.getVehicleAvailableSeats() == null) {
                        throw new IllegalArgumentException("Available seats must be provided for a new vehicle.");
                    }
                    VehicleEntity newVehicle = new VehicleEntity();
                    newVehicle.setPlateNumber(bookingRequest.getPlateNumber());
                    newVehicle.setAvailableSeats(bookingRequest.getVehicleAvailableSeats());
                    // Potentially set other default vehicle properties
                    return vehicleRepository.save(newVehicle);
                });

        if (vehicle.getAvailableSeats() < bookingRequest.getNumberOfPassengers()) {
            throw new IllegalArgumentException("Not enough seats available in vehicle with plate number: " + vehicle.getPlateNumber());
        }
        vehicle.setAvailableSeats(vehicle.getAvailableSeats() - bookingRequest.getNumberOfPassengers());
        vehicleRepository.save(vehicle); // Save updated vehicle seats

        // --- Create and Populate Booking Entity ---
        BookingEntity booking = new BookingEntity();
        booking.setPickUp(bookingRequest.getPickUp());
        booking.setDropOff(bookingRequest.getDropOff());
        booking.setRequestDate(LocalDateTime.now());

        booking.setStartDate(bookingRequest.getStartDate());
        booking.setEndDate(bookingRequest.getEndDate());
        booking.setNumberOfPassengers(bookingRequest.getNumberOfPassengers());
        try {
            booking.setStatus(BookingEntity.Status.valueOf(bookingRequest.getStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid booking status provided: " + bookingRequest.getStatus());
        }
        booking.setVehicle(vehicle);
        booking.setUser(currentUser); // <-- *** SET THE USER HERE ***

        // --- Save the Booking ---
        return bookingRepository.save(booking); // Now 'user' field is populated
    }

    public void deleteBooking(Long id) {
        bookingRepository.findById(id).ifPresent(booking -> {
            VehicleEntity vehicle = booking.getVehicle();
            if (vehicle != null) {
                vehicle.setAvailableSeats(vehicle.getAvailableSeats() + booking.getNumberOfPassengers());
                vehicleRepository.save(vehicle);
            }
            bookingRepository.deleteById(id);
        });
    }

    public BookingEntity updateBooking(Long id, BookingEntity updatedBooking) {
        return bookingRepository.findById(id).map(existingBooking -> {
            if (existingBooking.getStatus() != BookingEntity.Status.Canceled &&
                    updatedBooking.getStatus() == BookingEntity.Status.Canceled) {
                VehicleEntity vehicle = existingBooking.getVehicle();
                if (vehicle != null) {
                    vehicle.setAvailableSeats(vehicle.getAvailableSeats() + existingBooking.getNumberOfPassengers());
                    vehicleRepository.save(vehicle);
                }
            }

            // --- Check for status changes and set timestamps ---
            // Assuming BookingEntity.Status is an enum and updatedBooking.getStatus() is the new status

            // If status changes to ACCEPTED and acceptedAt is not already set
            if (existingBooking.getStatus() != BookingEntity.Status.Accepted &&
                    updatedBooking.getStatus() == BookingEntity.Status.Accepted &&
                    existingBooking.getStartDate() == null) // Assuming getAcceptedAt() exists on BookingEntity
            {
                existingBooking.setStartDate(LocalDateTime.now()); // Assuming setAcceptedAt(LocalDateTime) exists
            }

            // If status changes to DONE and completedAt is not already set
            if (existingBooking.getStatus() != BookingEntity.Status.Done &&
                    updatedBooking.getStatus() == BookingEntity.Status.Done &&
                    existingBooking.getEndDate() == null) // Assuming getCompletedAt() exists
            {
                existingBooking.setEndDate(LocalDateTime.now()); // Assuming setCompletedAt(LocalDateTime) exists
                // You might also want to set the actual end date/time here if different from planned endDate
                // existingBooking.setEndDate(LocalDateTime.now());
            }


            // --- Update other fields (be careful which fields are allowed to be updated via this endpoint) ---
            // Note: You might NOT want the client to update ALL these fields via a generic PUT
            // A more robust approach might be separate endpoints for status updates vs. other edits.
            // However, matching your current structure:
            existingBooking.setStartDate(updatedBooking.getStartDate()); // Careful: Should client update trip start date?
            existingBooking.setEndDate(updatedBooking.getEndDate());   // Careful: Should client update trip end date?
            existingBooking.setNumberOfPassengers(updatedBooking.getNumberOfPassengers()); // Careful: Should client update passengers after booking?

            // Always update the status if it's provided
            existingBooking.setStatus(updatedBooking.getStatus());


            // --- Save the updated booking ---
            return bookingRepository.save(existingBooking);
        }).orElse(null);
    }

    @Transactional(readOnly = true) // Read-only transaction is sufficient
    public List<BookingEntity> getBookingsForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User must be authenticated to view their bookings.");
        }

        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            throw new IllegalStateException("Could not determine username from authentication principal.");
        }

        UserEntity currentUser = userRepository.findByEmail(username) // Or findByUsername depending on your setup
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + username));

        return bookingRepository.findByUser(currentUser);
        // Or if using findByUser_Userid:
        // return bookingRepository.findByUser_Userid(currentUser.getUserid());
    }

}
