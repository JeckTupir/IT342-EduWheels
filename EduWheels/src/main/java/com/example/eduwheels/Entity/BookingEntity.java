package com.example.eduwheels.Entity;

import com.example.eduwheels.dto.LocationDTO;
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

    // KEEP THESE FOR BACKWARD COMPATIBILITY
    private String pickUp;
    private String dropOff;
    
    // NEW: Add these location fields
    @Column(name = "pick_up_address", length = 500)
    private String pickUpAddress;

    @Column(name = "pick_up_latitude", columnDefinition = "DECIMAL(10, 8)")
    private Double pickUpLatitude;

    @Column(name = "pick_up_longitude", columnDefinition = "DECIMAL(11, 8)")
    private Double pickUpLongitude;


    @Column(name = "pick_up_place_id", length = 255)
    private String pickUpPlaceId;

    @Column(name = "drop_off_address", length = 500)
    private String dropOffAddress;

    @Column(name = "drop_off_latitude", columnDefinition = "DECIMAL(10, 8)")
    private Double dropOffLatitude;

    @Column(name = "drop_off_longitude", columnDefinition = "DECIMAL(11, 8)")
    private Double dropOffLongitude;

    @Column(name = "drop_off_place_id", length = 255)
    private String dropOffPlaceId;
    
    private int numberOfPassengers;
    private LocalDateTime requestDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        Pending, Approved, Rejected, Going, Done, Canceled
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

    // NEW: Helper methods for LocationDTO
    public void setPickUpLocation(LocationDTO location) {
        if (location != null && location.isValid()) {
            this.pickUpAddress = location.getAddress();
            this.pickUpLatitude = location.getLatitude();
            this.pickUpLongitude = location.getLongitude();
            this.pickUpPlaceId = location.getPlaceId();
            // Also update legacy field for backward compatibility
            this.pickUp = location.getAddress();
        }
    }

    public void setDropOffLocation(LocationDTO location) {
        if (location != null && location.isValid()) {
            this.dropOffAddress = location.getAddress();
            this.dropOffLatitude = location.getLatitude();
            this.dropOffLongitude = location.getLongitude();
            this.dropOffPlaceId = location.getPlaceId();
            // Also update legacy field for backward compatibility
            this.dropOff = location.getAddress();
        }
    }

    public LocationDTO getPickUpLocation() {
        LocationDTO location = new LocationDTO();
        // Prefer new fields, fallback to old
        location.setAddress(this.pickUpAddress != null ? this.pickUpAddress : this.pickUp);
        location.setLatitude(this.pickUpLatitude);
        location.setLongitude(this.pickUpLongitude);
        location.setPlaceId(this.pickUpPlaceId);
        return location;
    }

    public LocationDTO getDropOffLocation() {
        LocationDTO location = new LocationDTO();
        // Prefer new fields, fallback to old
        location.setAddress(this.dropOffAddress != null ? this.dropOffAddress : this.dropOff);
        location.setLatitude(this.dropOffLatitude);
        location.setLongitude(this.dropOffLongitude);
        location.setPlaceId(this.dropOffPlaceId);
        return location;
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

    // NEW: Getters and setters for new location fields
    public String getPickUpAddress() {
        return pickUpAddress;
    }

    public void setPickUpAddress(String pickUpAddress) {
        this.pickUpAddress = pickUpAddress;
    }

    public Double getPickUpLatitude() {
        return pickUpLatitude;
    }

    public void setPickUpLatitude(Double pickUpLatitude) {
        this.pickUpLatitude = pickUpLatitude;
    }

    public Double getPickUpLongitude() {
        return pickUpLongitude;
    }

    public void setPickUpLongitude(Double pickUpLongitude) {
        this.pickUpLongitude = pickUpLongitude;
    }

    public String getPickUpPlaceId() {
        return pickUpPlaceId;
    }

    public void setPickUpPlaceId(String pickUpPlaceId) {
        this.pickUpPlaceId = pickUpPlaceId;
    }

    public String getDropOffAddress() {
        return dropOffAddress;
    }

    public void setDropOffAddress(String dropOffAddress) {
        this.dropOffAddress = dropOffAddress;
    }

    public Double getDropOffLatitude() {
        return dropOffLatitude;
    }

    public void setDropOffLatitude(Double dropOffLatitude) {
        this.dropOffLatitude = dropOffLatitude;
    }

    public Double getDropOffLongitude() {
        return dropOffLongitude;
    }

    public void setDropOffLongitude(Double dropOffLongitude) {
        this.dropOffLongitude = dropOffLongitude;
    }

    public String getDropOffPlaceId() {
        return dropOffPlaceId;
    }

    public void setDropOffPlaceId(String dropOffPlaceId) {
        this.dropOffPlaceId = dropOffPlaceId;
    }

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
