package com.example.eduwheels.Controller;

import com.example.eduwheels.Entity.VehicleEntity;
import com.example.eduwheels.Service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.prepost.PreAuthorize;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @GetMapping
    public List<VehicleEntity> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleEntity> getVehicleById(@PathVariable Long id) {
        VehicleEntity vehicle = vehicleService.getVehicleById(id);
        return (vehicle != null) ? ResponseEntity.ok(vehicle) : ResponseEntity.notFound().build();
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<VehicleEntity> createVehicle(@RequestBody VehicleEntity vehicle) {
        try {
            VehicleEntity created = vehicleService.createVehicle(vehicle);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<VehicleEntity> updateVehicle(@PathVariable Long id, @RequestBody VehicleEntity updatedVehicle) {
        if (vehicleService.getVehicleById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            VehicleEntity vehicle = vehicleService.updateVehicle(id, updatedVehicle);
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        boolean deleted = vehicleService.deleteVehicle(id);
        return (deleted) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // --- FIX: Create Vehicle with Photo and availableSeats ---
    @PostMapping(path = "/withPhoto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> createVehicleWithPhoto(
            @RequestParam String plateNumber,
            @RequestParam String type,
            @RequestParam int capacity,
            @RequestParam int availableSeats, // <-- added availableSeats
            @RequestParam String status,
            @RequestParam String vehicleName,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            if (plateNumber.isBlank() || vehicleName.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Plate number and vehicle name are required."));
            }

            String photoPath = null;
            if (photo != null && !photo.isEmpty()) {
                photoPath = vehicleService.saveImageToFilesystem(photo);
            }

            VehicleEntity vehicle = new VehicleEntity(plateNumber, type, capacity, availableSeats, status, photoPath, vehicleName);
            VehicleEntity created = vehicleService.createVehicle(vehicle);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (IOException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error saving photo: " + ex.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating vehicle: " + e.getMessage()));
        }
    }

    // --- FIX: Update Vehicle with Photo and availableSeats ---
    @PutMapping(path = "/updateWithPhoto/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateVehicleWithPhoto(
            @PathVariable Long id,
            @RequestParam String plateNumber,
            @RequestParam String type,
            @RequestParam int capacity,
            @RequestParam int availableSeats, // <-- added availableSeats
            @RequestParam String status,
            @RequestParam String vehicleName,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            VehicleEntity existing = vehicleService.getVehicleById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Vehicle not found with ID: " + id));
            }

            existing.setPlateNumber(plateNumber);
            existing.setType(type);
            existing.setCapacity(capacity);
            existing.setAvailableSeats(availableSeats);
            existing.setStatus(status);
            existing.setVehicleName(vehicleName);

            if (photo != null && !photo.isEmpty()) {
                String photoPath = vehicleService.saveImageToFilesystem(photo);
                existing.setPhotoPath(photoPath);
            }

            VehicleEntity updated = vehicleService.updateVehicle(id, existing);
            return ResponseEntity.ok(updated);

        } catch (IOException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error saving photo: " + ex.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating vehicle: " + e.getMessage()));
        }
    }

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path uploadDir = Paths.get("uploads");
            Path file = uploadDir.resolve(filename).normalize();

            if (!Files.exists(file) || !Files.isReadable(file)) {
                return ResponseEntity.notFound().build();
            }

            if (!file.startsWith(uploadDir.toAbsolutePath())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new UrlResource(file.toUri());
            String contentType = Files.probeContentType(file);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
