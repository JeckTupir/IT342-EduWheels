-- Migration script to add Google Maps location fields to booking table
-- Run this SQL script in your MySQL database

-- Add new location columns
ALTER TABLE tblbooking 
ADD COLUMN pick_up_address VARCHAR(500),
ADD COLUMN pick_up_latitude DECIMAL(10, 8),
ADD COLUMN pick_up_longitude DECIMAL(11, 8),
ADD COLUMN pick_up_place_id VARCHAR(255),
ADD COLUMN drop_off_address VARCHAR(500),
ADD COLUMN drop_off_latitude DECIMAL(10, 8),
ADD COLUMN drop_off_longitude DECIMAL(11, 8),
ADD COLUMN drop_off_place_id VARCHAR(255);

-- Create indexes for location queries
CREATE INDEX idx_pickup_location ON tblbooking(pick_up_latitude, pick_up_longitude);
CREATE INDEX idx_dropoff_location ON tblbooking(drop_off_latitude, drop_off_longitude);

-- Migrate existing data from old columns to new columns
UPDATE tblbooking 
SET pick_up_address = pickUp,
    drop_off_address = dropOff
WHERE pick_up_address IS NULL;

-- Note: Run this script manually in your MySQL database
-- Or use a migration tool like Flyway or Liquibase
