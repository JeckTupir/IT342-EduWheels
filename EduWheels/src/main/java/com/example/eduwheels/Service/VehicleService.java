package com.example.eduwheels.Service;

import com.example.eduwheels.Entity.VehicleEntity;
import com.example.eduwheels.Repository.VehicleRepository;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private Storage storage; // Inject the Google Cloud Storage client

    @Value("${gcs.bucket.name}")
    private String bucketName;

    // CRUD methods (getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle) remain largely the same
    // You'll only need to adjust how the photoPath is handled

    public String uploadImageToGCS(MultipartFile file) throws IOException {
        String imageName = "vehicles/" + UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        BlobId blobId = BlobId.of(bucketName, imageName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        // Return the public URL of the uploaded image
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, imageName);
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
                    existing.setAvailableSeats(updated.getAvailableSeats()); // Ensure this is mapped
                    existing.setStatus(updated.getStatus());
                    existing.setPhotoPath(updated.getPhotoPath()); // Will now be a GCS URL
                    existing.setVehicleName(updated.getVehicleName());
                    return vehicleRepository.save(existing);
                })
                .orElse(null);
    }

    public boolean deleteVehicle(Long id) {
        if (vehicleRepository.existsById(id)) {
            // Consider deleting the image from GCS here if needed
            vehicleRepository.deleteById(id);
            return true;
        }
        return false;
    }
}