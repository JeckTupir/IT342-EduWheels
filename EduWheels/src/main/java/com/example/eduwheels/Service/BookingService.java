package com.example.eduwheels.Service;

import com.example.eduwheels.Entity.BookingEntity;
import com.example.eduwheels.Entity.VehicleEntity;
import com.example.eduwheels.Entity.UserEntity;
import com.example.eduwheels.Repository.BookingRepository;
import com.example.eduwheels.Repository.VehicleRepository;
import com.example.eduwheels.Repository.UserRepository;
import com.example.eduwheels.Controller.BookingController.BookingRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private UserRepository userRepository;

    public List<BookingEntity> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<BookingEntity> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public BookingEntity createBooking(BookingRequest bookingRequest) {
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
        } else {
            throw new IllegalStateException("Could not determine username from authentication principal.");
        }

        UserEntity currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + username));

        if (bookingRequest.getPlateNumber() == null || bookingRequest.getPlateNumber().isEmpty()) {
            throw new IllegalArgumentException("Vehicle plate number is required for creating a booking.");
        }
        VehicleEntity vehicle = vehicleRepository.findByPlateNumber(bookingRequest.getPlateNumber())
                .orElseGet(() -> {
                    if (bookingRequest.getVehicleAvailableSeats() == null) {
                        throw new IllegalArgumentException("Available seats must be provided for a new vehicle.");
                    }
                    VehicleEntity newVehicle = new VehicleEntity();
                    newVehicle.setPlateNumber(bookingRequest.getPlateNumber());
                    newVehicle.setAvailableSeats(bookingRequest.getVehicleAvailableSeats());
                    return vehicleRepository.save(newVehicle);
                });

        if (vehicle.getAvailableSeats() < bookingRequest.getNumberOfPassengers()) {
            throw new IllegalArgumentException("Not enough seats available in vehicle with plate number: " + vehicle.getPlateNumber());
        }
        vehicle.setAvailableSeats(vehicle.getAvailableSeats() - bookingRequest.getNumberOfPassengers());
        vehicleRepository.save(vehicle);

        BookingEntity booking = new BookingEntity();
        booking.setPickUp(bookingRequest.getPickUp());
        booking.setDropOff(bookingRequest.getDropOff());
        booking.setRequestDate(LocalDateTime.now());
        booking.setStartDate(bookingRequest.getStartDate());
        booking.setEndDate(bookingRequest.getEndDate());
        booking.setNumberOfPassengers(bookingRequest.getNumberOfPassengers());
        try {
            booking.setStatus(BookingEntity.Status.valueOf(bookingRequest.getStatus()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid booking status provided: " + bookingRequest.getStatus());
        }
        booking.setVehicle(vehicle);
        booking.setUser(currentUser);

        return bookingRepository.save(booking);
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
            if (existingBooking.getStatus() != BookingEntity.Status.Approved &&
                    updatedBooking.getStatus() == BookingEntity.Status.Approved &&
                    existingBooking.getStartDate() == null) {
                existingBooking.setStartDate(LocalDateTime.now());
            }

            if (existingBooking.getStatus() != BookingEntity.Status.Done &&
                    updatedBooking.getStatus() == BookingEntity.Status.Done) {
                if (updatedBooking.getEndDate() != null) {
                    existingBooking.setEndDate(updatedBooking.getEndDate());
                } else if (existingBooking.getEndDate() == null) {
                    existingBooking.setEndDate(LocalDateTime.now());
                }
            }

            // --- Update other fields ---
            existingBooking.setStartDate(updatedBooking.getStartDate());
            existingBooking.setEndDate(updatedBooking.getEndDate());
            existingBooking.setNumberOfPassengers(updatedBooking.getNumberOfPassengers());
            existingBooking.setStatus(updatedBooking.getStatus());

            return bookingRepository.save(existingBooking);
        }).orElse(null);
    }

    @Transactional(readOnly = true)
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

        UserEntity currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + username));

        return bookingRepository.findByUser(currentUser);
    }
}