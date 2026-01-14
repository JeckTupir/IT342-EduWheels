package com.example.eduwheels.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LocationDTO {
    
    @JsonProperty("address")
    private String address;
    
    @JsonProperty("latitude")
    private Double latitude;
    
    @JsonProperty("longitude")
    private Double longitude;
    
    @JsonProperty("placeId")
    private String placeId;
    
    // Constructors
    public LocationDTO() {}
    
    public LocationDTO(String address, Double latitude, Double longitude, String placeId) {
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.placeId = placeId;
    }
    
    // Getters and Setters
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    public String getPlaceId() {
        return placeId;
    }
    
    public void setPlaceId(String placeId) {
        this.placeId = placeId;
    }
    
    // Validation helper
    public boolean isValid() {
        return address != null && !address.trim().isEmpty() 
            && latitude != null && longitude != null;
    }
    
    @Override
    public String toString() {
        return "LocationDTO{" +
                "address='" + address + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", placeId='" + placeId + '\'' +
                '}';
    }
}
