-- ===================================================================
-- DATABASE VERIFICATION SCRIPT
-- Run this AFTER running the migration to verify everything is correct
-- ===================================================================

-- 1. Check if new columns exist
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    NUMERIC_PRECISION,
    NUMERIC_SCALE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'tblbooking'
  AND TABLE_SCHEMA = DATABASE()
  AND (
    COLUMN_NAME LIKE '%pick_up%' 
    OR COLUMN_NAME LIKE '%drop_off%'
  )
ORDER BY ORDINAL_POSITION;

-- Expected output should show:
-- pickUp, dropOff (old columns)
-- pick_up_address, pick_up_latitude, pick_up_longitude, pick_up_place_id
-- drop_off_address, drop_off_latitude, drop_off_longitude, drop_off_place_id

-- 2. Check if indexes were created
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_NAME = 'tblbooking'
  AND TABLE_SCHEMA = DATABASE()
  AND INDEX_NAME IN ('idx_pickup_location', 'idx_dropoff_location')
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- Expected output:
-- idx_pickup_location on pick_up_latitude, pick_up_longitude
-- idx_dropoff_location on drop_off_latitude, drop_off_longitude

-- 3. Check table structure
DESCRIBE tblbooking;

-- 4. Count existing bookings (before new system)
SELECT COUNT(*) as old_bookings_count
FROM tblbooking
WHERE pick_up_address IS NULL;

-- 5. Sample data from most recent booking
SELECT 
    bookingID,
    pickUp as 'Old Pick-up',
    pick_up_address as 'New Pick-up Address',
    pick_up_latitude as 'Latitude',
    pick_up_longitude as 'Longitude',
    dropOff as 'Old Drop-off',
    drop_off_address as 'New Drop-off Address',
    status
FROM tblbooking
ORDER BY bookingID DESC
LIMIT 5;

-- ===================================================================
-- TROUBLESHOOTING QUERIES
-- ===================================================================

-- If columns don't exist, run this:
/*
ALTER TABLE tblbooking 
ADD COLUMN pick_up_address VARCHAR(500),
ADD COLUMN pick_up_latitude DECIMAL(10, 8),
ADD COLUMN pick_up_longitude DECIMAL(11, 8),
ADD COLUMN pick_up_place_id VARCHAR(255),
ADD COLUMN drop_off_address VARCHAR(500),
ADD COLUMN drop_off_latitude DECIMAL(10, 8),
ADD COLUMN drop_off_longitude DECIMAL(11, 8),
ADD COLUMN drop_off_place_id VARCHAR(255);
*/

-- If indexes don't exist, run this:
/*
CREATE INDEX idx_pickup_location ON tblbooking(pick_up_latitude, pick_up_longitude);
CREATE INDEX idx_dropoff_location ON tblbooking(drop_off_latitude, drop_off_longitude);
*/

-- ===================================================================
-- TEST INSERT (Optional - to verify structure)
-- ===================================================================
/*
INSERT INTO tblbooking (
    userID,
    vehicleID,
    pickUp,
    pick_up_address,
    pick_up_latitude,
    pick_up_longitude,
    pick_up_place_id,
    dropOff,
    drop_off_address,
    drop_off_latitude,
    drop_off_longitude,
    drop_off_place_id,
    numberOfPassengers,
    requestDate,
    startDate,
    endDate,
    status
) VALUES (
    1,  -- Replace with actual user ID
    1,  -- Replace with actual vehicle ID
    'University of Cebu',
    'University of Cebu, Sanciangko St, Cebu City, 6000 Central Visayas, Philippines',
    10.293661,
    123.902386,
    'ChIJXxYxYxYqqTMRwBk1TxIO2cI',
    'Ayala Center Cebu',
    'Ayala Center Cebu, Cardinal Rosales Avenue, Cebu Business Park, Cebu City, 6000 Central Visayas, Philippines',
    10.319023,
    123.905468,
    'ChIJ93jCvQSVqTMRUF-dwZE8-w8',
    15,
    NOW(),
    NOW(),
    DATE_ADD(NOW(), INTERVAL 2 HOUR),
    'Pending'
);

-- Verify the test insert
SELECT * FROM tblbooking WHERE bookingID = LAST_INSERT_ID();
*/

-- ===================================================================
-- CLEANUP QUERY (Use with caution!)
-- ===================================================================
-- To remove test data:
-- DELETE FROM tblbooking WHERE bookingID = [your_test_booking_id];

-- ===================================================================
-- SUCCESS INDICATORS
-- ===================================================================
-- ✅ Query 1 should show 10-12 columns related to locations
-- ✅ Query 2 should show 2 indexes (4 total rows)
-- ✅ Query 3 should show all columns including new ones
-- ✅ Query 5 should show data from recent bookings
-- ===================================================================
