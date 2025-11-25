import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookingPage.css';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import DraggableMapModal from '../../components/DraggableMapModal';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Divider
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  DirectionsCar,
  People,
  CheckCircle,
  Map as MapIcon
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function BookingPage() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [pickUpLocation, setPickUpLocation] = useState(null);
    const [dropOffLocation, setDropOffLocation] = useState(null);
    const [passengers, setPassengers] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [mapModalOpen, setMapModalOpen] = useState(false);

    const getImageUrl = (path) => {
        if (!path) return '/assets/bus-logo.png';
        return path;
    };

    // --- NEW: Check Vehicle Seat Availability Before Booking ---
    const refreshVehicleAvailability = async (vehicles) => {
        const updatedList = [];

        for (const v of vehicles) {
            try {
                const res = await axios.get(
                    `${API_BASE_URL}/api/bookings/vehicle/${v.plateNumber}/availability`
                );

                const updated = {
                    ...v,
                    availableSeats: res.data.availableSeats,
                    status: res.data.availableSeats > 0 ? "Available" : "Full"
                };

                updatedList.push(updated);
            } catch (error) {
                console.error("Error refreshing seat availability:", error);
                updatedList.push(v); // fallback
            }
        }

        return updatedList;
    };

    // Fetch vehicles based on passenger count
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Load from database
                const response = await axios.get(`${API_BASE_URL}/api/vehicles`);
                let allVehicles = response.data;

                // 2. Refresh availability using your new backend API
                allVehicles = await refreshVehicleAvailability(allVehicles);

                // 3. Filter only AVAILABLE vehicles with enough seats
                let availableVehicles = allVehicles.filter(
                    v => v.status === "Available" && v.availableSeats >= passengers
                );

                // 4. Sort lowest seats first
                availableVehicles.sort((a, b) => a.availableSeats - b.availableSeats);

                // 5. Update UI
                setVehicles(availableVehicles);
                setCurrentIndex(0);

            } catch (error) {
                console.error("Error fetching vehicles:", error);
                setError("Could not load available vehicles.");
            } finally {
                setLoading(false);
            }
        };

        if (passengers > 0) {
            fetchVehicles();
        } else {
            setVehicles([]);
        }
    }, [passengers]);

    // --- NEW: Check Vehicle Seat Availability Before Booking ---
    const checkSeatAvailability = async (plateNumber) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/bookings/vehicle/${plateNumber}/availability`
            );
            return response.data; // contains updated availableSeats + status
        } catch (error) {
            console.error("Error checking seat availability:", error);
            return null;
        }
    };

    const handleBookNow = async () => {
        // LIVE SEAT CHECK BEFORE BOOKING
        const refreshedVehicle = await checkSeatAvailability(vehicles[currentIndex].plateNumber);

        if (!refreshedVehicle) {
            setError("Unable to verify seat availability. Please try again.");
            return;
        }

// If seats already updated to 0
        if (refreshedVehicle.availableSeats <= 0) {
            setError(`This vehicle is now FULL. Please choose another one.`);
            return;
        }

// If passenger count exceeds current availability
        if (passengers > refreshedVehicle.availableSeats) {
            setError(
                `Only ${refreshedVehicle.availableSeats} seat(s) left. Please reduce passengers or choose another vehicle.`
            );
            return;
        }

        // Validation
        if (!vehicles[currentIndex]) {
            setError("No vehicle selected.");
            return;
        }
        if (!pickUpLocation || !pickUpLocation.address) {
            setError("Please select a pick-up location.");
            return;
        }
        if (!dropOffLocation || !dropOffLocation.address) {
            setError("Please select a drop-off location.");
            return;
        }
        if (passengers <= 0 || passengers > vehicles[currentIndex].capacity) {
            setError(`Please enter a valid number of passengers (1-${vehicles[currentIndex].capacity}).`);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authentication required. Please log in.");
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        // Create booking data with new location format
        const bookingData = {
            plateNumber: vehicles[currentIndex].plateNumber,
            vehicleAvailableSeats: vehicles[currentIndex].availableSeats,
            pickUpLocation: {
                address: pickUpLocation.address,
                latitude: pickUpLocation.latitude,
                longitude: pickUpLocation.longitude,
                placeId: pickUpLocation.placeId
            },
            dropOffLocation: {
                address: dropOffLocation.address,
                latitude: dropOffLocation.latitude,
                longitude: dropOffLocation.longitude,
                placeId: dropOffLocation.placeId
            },
            requestDate: new Date().toISOString(),
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
            status: "Pending",
            numberOfPassengers: passengers
        };

        try {
            await axios.post(`${API_BASE_URL}/api/bookings`, bookingData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setSuccess("Booking successful! Redirecting to your profile...");
            setTimeout(() => navigate("/profile"), 2000);
        } catch (error) {
            console.error("Error creating booking:", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
            setError(`Failed to create booking: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? vehicles.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === vehicles.length - 1 ? 0 : prevIndex + 1
        );
    };

    // Handle map modal
    const handleOpenMapModal = () => {
        setMapModalOpen(true);
    };

    const handleCloseMapModal = () => {
        setMapModalOpen(false);
    };

    const handleLocationChange = (newPickUp, newDropOff) => {
        setPickUpLocation(newPickUp);
        setDropOffLocation(newDropOff);
    };

    const currentVehicle = vehicles[currentIndex];

    return (
        <Box className="booking-root" sx={{ minHeight: '100%', backgroundColor: '#f5f5f5', p: 1 }}>
            <Box className="booking-container" sx={{ maxWidth: '1500px', margin: '0 auto', p: 1 }}>
                {/* Header */}

                {/* Error/Success Messages */}
                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 4, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
                    {/* Left Section - Booking Form */}
                    <Paper elevation={3} sx={{ maxHeight: '500px', flex: 1, p: 4, minWidth: { xs: '100%', lg: '500px' } }}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 0, fontWeight: 'bold' }}>
                            Trip Details
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Number of Passengers */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <People /> Number of Passengers
                                </Typography>
                                <TextField
                                    type="number"
                                    fullWidth
                                    value={passengers}
                                    onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                                    InputProps={{ inputProps: { min: 1 } }}
                                    placeholder="Enter number of passengers"
                                />
                            </Box>

                            <Divider />

                            {/* Pick-up Location */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                </Typography>
                                <AddressAutocomplete
                                    value={pickUpLocation}
                                    onChange={setPickUpLocation}
                                    label="Pick-up Address"
                                    placeholder="Enter pick-up address (e.g., University of Cebu)"
                                    required
                                    disabled={loading}
                                />
                            </Box>

                            {/* Drop-off Location */}
                            <Box>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                </Typography>
                                <AddressAutocomplete
                                    value={dropOffLocation}
                                    onChange={setDropOffLocation}
                                    label="Drop-off Address"
                                    placeholder="Enter drop-off address (e.g., Ayala Center Cebu)"
                                    required
                                    disabled={loading}
                                />
                            </Box>

                            {/* Preview Map Button */}
                            {(pickUpLocation || dropOffLocation) && (
                                <Box sx={{ mt: 2 }}>                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<MapIcon />}
                                        onClick={handleOpenMapModal}
                                        sx={{
                                            py: 1.5,
                                            borderColor: '#CA8787',
                                            color: '#CA8787',
                                            '&:hover': {
                                                borderColor: '#B57676',
                                                backgroundColor: 'rgba(202, 135, 135, 0.1)',
                                            },
                                        }}
                                    >
                                        Preview & Adjust on Map
                                    </Button>
                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                                        Drag markers to fine-tune locations
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    {/* Right Section - Vehicle Selection */}
                    <Paper elevation={3} sx={{ maxHeight: '500px',flex: 1, p: 4, minWidth: { xs: '100%', lg: '500px' } }}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 0, fontWeight: 'bold' }}>
                            Available Vehicles
                        </Typography>

                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress />
                            </Box>
                        )}

                        {!loading && vehicles.length === 0 && (
                            <Alert severity="info">
                                No vehicles available for {passengers} passenger(s). Try adjusting the number of passengers.
                            </Alert>
                        )}

                        {!loading && vehicles.length > 0 && currentVehicle && (
                            <Box>
                                {/* Vehicle Carousel */}
                                <Box sx={{ position: 'relative' }}>
                                    <Card>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                            <CardMedia
                                                component="img"
                                                sx={{
                                                    width: 'auto',      // Forces image to be 150px wide
                                                    height: 130,  // Maintains aspect ratio based on width
                                                    borderRadius: 1
                                                }}
                                                image={getImageUrl(currentVehicle.photoPath)}
                                                alt={currentVehicle.vehicleName || currentVehicle.type}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/assets/bus-logo.png';
                                                }}
                                            />
                                        </Box>
                                        <CardContent>
                                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                {currentVehicle.vehicleName || currentVehicle.type}
                                            </Typography>

                                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Capacity:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {currentVehicle.capacity} passengers
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Available Seats:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold" color="success.main">
                                                        {currentVehicle.availableSeats ?? currentVehicle.capacity}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Plate Number:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {currentVehicle.plateNumber}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Status:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CheckCircle color="success" fontSize="small" />
                                                        <Typography variant="body2" fontWeight="bold" color="success.main">
                                                            {currentVehicle.status}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>

                                    {/* Carousel Controls */}
                                    {vehicles.length > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                            <IconButton
                                                onClick={handlePrev}
                                                sx={{ backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}
                                            >
                                                <ChevronLeft />
                                            </IconButton>

                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                                {currentIndex + 1} / {vehicles.length}
                                            </Typography>

                                            <IconButton
                                                onClick={handleNext}
                                                sx={{ backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}
                                            >
                                                <ChevronRight />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>

                                {/* Book Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleBookNow}
                                    disabled={loading || !pickUpLocation || !dropOffLocation}
                                    startIcon={<DirectionsCar />}
                                    sx={{
                                        mt: 3,
                                        py: 1.5,
                                        backgroundColor: '#CA8787',
                                        '&:hover': {
                                            backgroundColor: '#B57676'
                                        }
                                    }}
                                >
                                    {loading ? 'Processing...' : 'Book This Vehicle'}
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Draggable Map Modal */}
                <DraggableMapModal
                    open={mapModalOpen}
                    onClose={handleCloseMapModal}
                    pickUp={pickUpLocation}
                    dropOff={dropOffLocation}
                    onLocationChange={handleLocationChange}
                />
            </Box>
        </Box>
    );
}
