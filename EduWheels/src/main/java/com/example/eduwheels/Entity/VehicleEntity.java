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

    @Column(nullable = false)
    private String status;

    @Column(name = "photo_path", columnDefinition = "TEXT")
    private String photoPath; // Store the path to the image file

    // Constructors
    public VehicleEntity() {
    }

    public VehicleEntity(String plateNumber, String type, int capacity, String status, String photoPath) {
        this.plateNumber = plateNumber;
        this.type = type;
        this.capacity = capacity;
        this.status = status;
        this.photoPath = photoPath;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPhotoPath() {
        return photoPath;
    }

    public void setPhotoPath(String photoPath) {
        this.photoPath = photoPath;
    }
}