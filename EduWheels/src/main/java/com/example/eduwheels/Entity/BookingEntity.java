package com.example.eduwheels.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tblbooking")
public class BookingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingID;

    @ManyToOne
    @JoinColumn(name = "userID", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "vehicleID", nullable = false)
    private VehicleEntity vehicle;

    private String pickUp;
    private String dropOff;
    private int numberOfPassengers;
    private LocalDateTime requestDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        Pending, Approved, Rejected, Going, Done, Accepted, Canceled
    }

    // Default constructor
    public BookingEntity() {
    }

    // All-args constructor
    public BookingEntity(UserEntity user, VehicleEntity vehicle, String pickUp, String dropOff, Integer numberOfPassengers, LocalDateTime requestDate, LocalDateTime startDate, LocalDateTime endDate, Status status) {
        this.user = user;
        this.vehicle = vehicle;
        this.pickUp = pickUp;
        this.dropOff = dropOff;
        this.numberOfPassengers = numberOfPassengers;
        this.requestDate = requestDate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    // Getters and Setters
    public Long getBookingID() {
        return bookingID;
    }

    public void setBookingID(Long bookingID) {
        this.bookingID = bookingID;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public VehicleEntity getVehicle() {
        return vehicle;
    }

    public void setVehicle(VehicleEntity vehicle) {
        this.vehicle = vehicle;
    }

    public String getPickUp() { return pickUp; }

    public void setPickUp(String pickUp) { this.pickUp = pickUp; }

    public String getDropOff() { return dropOff; }

    public void setDropOff(String dropOff) { this.dropOff = dropOff; }

    public Integer getNumberOfPassengers() { return numberOfPassengers; }

    public void setNumberOfPassengers(Integer numberOfPassengers) { this.numberOfPassengers = numberOfPassengers; }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
