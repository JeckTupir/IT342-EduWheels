package com.example.eduwheels.Service;

import com.example.eduwheels.Entity.VehicleEntity;
import com.example.eduwheels.Repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Value("${file.upload.directory}")
    private String uploadDirectory;

    private Path uploadPath;

    @PostConstruct
    public void init() throws IOException {
        uploadPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        if (Files.notExists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
    }

    // CRUD methods omitted for brevity… same as before

    public String saveImageToFilesystem(MultipartFile file) throws IOException {
        // Sanitize and build unique filename
        String original = Paths.get(file.getOriginalFilename()).getFileName().toString();
        String filename = UUID.randomUUID() + "_" + original;

        Path target = uploadPath.resolve(filename);

        // Copy, replacing any existing file with the same name
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // Return the public URI path
        return "/uploads/" + filename;
    }

    public List<VehicleEntity> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public VehicleEntity getVehicleById(Long id) {
        Optional<VehicleEntity> opt = vehicleRepository.findById(id);
        return opt.orElse(null);
    }

    public VehicleEntity createVehicle(VehicleEntity vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public VehicleEntity updateVehicle(Long id, VehicleEntity updated) {
        return vehicleRepository.findById(id)
                .map(existing -> {
                    existing.setPlateNumber(updated.getPlateNumber());
                    existing.setType(updated.getType());
                    existing.setCapacity(updated.getCapacity());
                    existing.setStatus(updated.getStatus());
                    existing.setPhotoPath(updated.getPhotoPath());
                    existing.setVehicleName(updated.getVehicleName());
                    return vehicleRepository.save(existing);
                })
                .orElse(null);
    }

    public boolean deleteVehicle(Long id) {
        if (vehicleRepository.existsById(id)) {
            vehicleRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
