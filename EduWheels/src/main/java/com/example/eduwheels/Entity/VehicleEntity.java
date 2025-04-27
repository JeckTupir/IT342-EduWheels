package com.example.eduwheels.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tblvehicles")
public class VehicleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    @Column(name = "plate_number", nullable = false, unique = true)
    private String plateNumber;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private int capacity;

    @Column(name = "available_seats", nullable = false)
    private int availableSeats;

    @Column(nullable = false)
    private String status;

    @Column(name = "photo_path", columnDefinition = "TEXT")
    private String photoPath; // Store the path to the image file

    @Column(name = "vehicle_name", nullable = false)
    private String vehicleName;

    // Constructors
    public VehicleEntity() {
    }

    public VehicleEntity(String plateNumber, String type, int capacity, int availableSeats, String status, String photoPath, String vehicleName) {
        this.plateNumber = plateNumber;
        this.type = type;
        this.capacity = capacity;
        this.availableSeats = availableSeats;
        this.status = status;
        this.photoPath = photoPath;
        this.vehicleName = vehicleName;
    }

    // Getters and Setters
    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getPlateNumber() {
        return plateNumber;
    }

    public void setPlateNumber(String plateNumber) {
        this.plateNumber = plateNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;

        this.vehicleName = vehicleName;
    }

    public String getPhotoPath() {
        return photoPath;
    }

    public void setPhotoPath(String photoPath) {
        this.photoPath = photoPath;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }
}