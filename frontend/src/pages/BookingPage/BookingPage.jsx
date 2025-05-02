import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Assuming you have a HeaderLoggedIn component
import Header from '../HeaderLoggedIn';
import axios from 'axios';
// Assuming you have a CSS file for styling
import './BookingPage.css';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Leaflet Icon Setup ---
// These lines fix a common issue with Leaflet icons in React/Webpack setups
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerRetina,
    iconUrl: markerIcon,
    shadowUrl: shadowUrl
});
// --- End Leaflet Icon Setup ---


// --- Location Picker Component ---
// A helper component to handle map clicks and update coordinates
function LocationPicker({ setAddress, addressType }) {
    useMapEvents({
        click: (e) => {
            // Update the parent component's state with the clicked coordinates
            setAddress(prev => ({ ...prev, [addressType]: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}` }));
        },
    });
    return null; // This component doesn't render anything itself
}
// --- End Location Picker Component ---


// --- Main Booking Page Component ---
export default function BookingPage() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]); // Stores available vehicles
    const [currentIndex, setCurrentIndex] = useState(0); // Index for the vehicle carousel
    const [addresses, setAddresses] = useState({ pickup: '', dropoff: '' }); // Pickup and dropoff locations
    const [showPickupMap, setShowPickupMap] = useState(false); // Toggle visibility of pickup map
    const [showDropoffMap, setShowDropoffMap] = useState(false); // Toggle visibility of dropoff map
    const [passengers, setPassengers] = useState(1); // Number of passengers
    const mapRef = useRef(null); // Ref for map instances (optional, can be useful)

    // Default map settings (Consider making these dynamic or configurable)
    const defaultCenter = [10.2914, 123.8943]; // Example: Cebu City coordinates
    const defaultZoom = 13;

    // --- Fetch Vehicles Effect ---
    // Fetches available vehicles when the component mounts or passenger count changes
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/vehicles");
                let availableVehicles = response.data.filter(vehicle => vehicle.status === "Available");

                availableVehicles = availableVehicles.filter(vehicle => vehicle.capacity >= passengers);

                availableVehicles.sort((a, b) => {
                    const aSeatsLeft = (a.availableSeats ?? a.capacity) - passengers;
                    const bSeatsLeft = (b.availableSeats ?? b.capacity) - passengers;

                    if (aSeatsLeft >= 0 && bSeatsLeft >= 0) {
                        return aSeatsLeft - bSeatsLeft;
                    }

                    if (aSeatsLeft < 0 && bSeatsLeft < 0) {
                        return a.capacity - b.capacity;
                    }

                    return aSeatsLeft >= 0 ? -1 : 1;
                });

                setVehicles(availableVehicles);
                setCurrentIndex(0);

            } catch (error) {
                console.error("Error fetching vehicles:", error);
                alert("Could not load available vehicles. Please try refreshing.");
            }
        };

        if (passengers > 0) {
            fetchVehicles();
        } else {
            setVehicles([]);
        }
    }, [passengers]);


    // --- Handle Booking Submission ---
    const handleBookNow = async () => {
        if (vehicles.length === 0 || currentIndex >= vehicles.length) {
            alert("No suitable vehicle available for the selected number of passengers, or no vehicle selected.");
            return;
        }
        const selectedVehicle = vehicles[currentIndex];

        if (passengers <= 0 || passengers > selectedVehicle.capacity) {
            alert(`Please enter a valid number of passengers (1-${selectedVehicle.capacity} for the selected vehicle).`);
            return;
        }

        if (!addresses.pickup || !addresses.dropoff) {
            alert("Please select both pick-up and drop-off locations on the map.");
            return; // Stop the booking process if locations are missing
        }

        const token = localStorage.getItem('token');

        if (!token) {
            alert("Authentication error. You need to be logged in to book. Redirecting to login...");
            navigate('/login');
            return;
        }

        // *** FIXED booking data ***
        const bookingData = {
            plateNumber: selectedVehicle.plateNumber,
            // Add pickup and dropoff locations from state
            pickUp: addresses.pickup, // Ensure backend expects 'pickUp' or adjust
            dropOff: addresses.dropoff, // Ensure backend expects 'dropOff' or adjust

            // Assuming requestDate should be the booking creation time
            requestDate: new Date().toISOString(),

            // startDate and endDate might represent the *planned* start/end time of the trip
            // The current default of +1 hour seems like a placeholder.
            // You might need to add UI for the user to select these.
            // For now, keeping the existing placeholder logic but adding requestDate.
            startDate: new Date().toISOString(), // Keeping as is for now, potentially map to tblbooking.start_date
            endDate: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // Keeping as is, potentially map to tblbooking.end_date

            status: "Pending", // Initial status
            numberOfPassengers: passengers
        };

        try {
            console.log("Sending booking data:", bookingData);
            const response = await axios.post(
                "http://localhost:8080/api/bookings",
                bookingData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Booking response:", response.data);
            alert("Booking successful!");
            navigate("/profile");

        } catch (error) {
            console.error("Error creating booking:", error);
            if (error.response) {
                const errorMessage = error.response.data?.message || error.response.data || 'An error occurred on the server.';
                alert(`Failed to create booking: ${errorMessage}. Please try again.`);
            } else if (error.request) {
                alert("Failed to create booking. Cannot reach the server. Please check your internet connection and ensure the server is running.");
            } else {
                alert("Failed to create booking. An unexpected client-side error occurred.");
            }
        }
    };
    // --- End Handle Booking Submission ---


    // --- Carousel Navigation ---
    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? vehicles.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === vehicles.length - 1 ? 0 : prevIndex + 1));
    };
    // --- End Carousel Navigation ---

    // --- Close Map Handlers ---
    // These functions simply hide the respective maps
    const closePickupMap = () => setShowPickupMap(false);
    const closeDropoffMap = () => setShowDropoffMap(false);
    // --- End Close Map Handlers ---


    // --- Render JSX ---
    return (
        // Use semantic class names for easier styling and understanding
        <div className="booking-page">
            {/* Optional: Include your logged-in header */}
            {/*<Header />*/}

            <div className="booking-container"> {/* Main content wrapper */}

                {/* Left Side: Booking Form */}
                <div className="booking-info-section">
                    <h2>Booking Information</h2>
                    <p>Select pickup & dropoff locations and number of passengers.</p>

                    <div className="booking-form">
                        {/* Pick Up Location Input & Map */}
                        <div className="booking-form-group">
                            <label htmlFor="pickup-address">Pick-up Location</label>
                            <div className="input-with-button">
                                <input
                                    id="pickup-address"
                                    type="text"
                                    placeholder="Select on map"
                                    value={addresses.pickup}
                                    readOnly // Prevent manual editing, force map selection
                                />
                                <button onClick={() => setShowPickupMap(true)} className="map-toggle-button">
                                    {addresses.pickup ? 'Change' : 'Select'} on Map
                                </button>
                            </div>
                            {showPickupMap && (
                                <div className="map-modal-backdrop"> {/* Optional: backdrop for modal effect */}
                                    <div className="map-modal-content">
                                        <h3>Select Pickup Location</h3>
                                        <MapContainer
                                            ref={mapRef} // Assign ref if needed later
                                            center={defaultCenter}
                                            zoom={defaultZoom}
                                            style={{ height: '300px', width: '100%' }}
                                            whenCreated={ mapInstance => { mapRef.current = mapInstance } } // Store map instance
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            {/* Marker for the selected location */}
                                            {addresses.pickup && (
                                                <Marker position={addresses.pickup.split(', ').map(Number)}>
                                                    <Popup>Pickup Location</Popup>
                                                </Marker>
                                            )}
                                            {/* Component that listens for map clicks */}
                                            <LocationPicker setAddress={setAddresses} addressType="pickup" />
                                        </MapContainer>
                                        <button onClick={closePickupMap} className="map-close-button">Confirm & Close Map</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drop Off Location Input & Map */}
                        <div className="booking-form-group">
                            <label htmlFor="dropoff-address">Drop-off Location</label>
                            <div className="input-with-button">
                                <input
                                    id="dropoff-address"
                                    type="text"
                                    placeholder="Select on map"
                                    value={addresses.dropoff}
                                    readOnly
                                />
                                <button onClick={() => setShowDropoffMap(true)} className="map-toggle-button">
                                    {addresses.dropoff ? 'Change' : 'Select'} on Map
                                </button>
                            </div>
                            {showDropoffMap && (
                                <div className="map-modal-backdrop">
                                    <div className="map-modal-content">
                                        <h3>Select Dropoff Location</h3>
                                        <MapContainer
                                            center={defaultCenter}
                                            zoom={defaultZoom}
                                            style={{ height: '300px', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            {addresses.dropoff && (
                                                <Marker position={addresses.dropoff.split(', ').map(Number)}>
                                                    <Popup>Dropoff Location</Popup>
                                                </Marker>
                                            )}
                                            <LocationPicker setAddress={setAddresses} addressType="dropoff" />
                                        </MapContainer>
                                        <button onClick={closeDropoffMap} className="map-close-button">Confirm & Close Map</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Number of Passengers Input */}
                        <div className="booking-form-group">
                            <label htmlFor="passengers">Number of Passengers</label>
                            <input
                                id="passengers"
                                type="number"
                                min="1" // Minimum 1 passenger
                                value={passengers}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    // Update state only if it's a positive number or empty string (allowing user to clear input)
                                    setPassengers(isNaN(val) || val < 1 ? 1 : val);
                                }}
                                placeholder="e.g., 2"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Vehicle Recommendation & Booking */}
                <div className="vehicle-recommendation-section">
                    <h3>Recommended Vehicle</h3>
                    <p>Based on {passengers} passenger{passengers !== 1 ? 's' : ''}.</p>

                    {/* Vehicle Carousel */}
                    <div className="vehicle-carousel-container">
                        {/* Show controls only if there's more than one vehicle */}
                        {vehicles.length > 1 && (
                            <button onClick={handlePrev} className="carousel-button prev" aria-label="Previous Vehicle">&lt;</button>
                        )}

                        <div className="vehicle-display">
                            {vehicles.length > 0 && currentIndex < vehicles.length ? (
                                <div className="vehicle-card">
                                    {/* Use placeholder or actual image */}
                                    <img
                                        // Construct the image URL carefully
                                        src={`http://localhost:8080/api/vehicles/uploads/${vehicles[currentIndex].photoPath}`}
                                        alt={vehicles[currentIndex].name || vehicles[currentIndex].type}
                                        // Add error handling for images
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x200/cccccc/ffffff?text=No+Image"; }}
                                        className="vehicle-image"
                                    />
                                    <div className="vehicle-details">
                                        <h4>{vehicles[currentIndex].vehicleName || vehicles[currentIndex].name || vehicles[currentIndex].type}</h4>
                                        <p>ID: {vehicles[currentIndex].vehicleId}</p>
                                        <p>Type: {vehicles[currentIndex].type}</p>
                                        <p>Capacity: {vehicles[currentIndex].capacity} passengers</p>
                                        <p>Available
                                            Seats: {vehicles[currentIndex].availableSeats ?? vehicles[currentIndex].capacity}</p>
                                        <p>Plate: {vehicles[currentIndex].plateNumber}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-vehicle-message">
                                    {passengers > 0 ? "No vehicles available for this number of passengers." : "Please enter the number of passengers."}
                                </div>
                            )}
                        </div>

                        {vehicles.length > 1 && (
                            <button onClick={handleNext} className="carousel-button next" aria-label="Next Vehicle">&gt;</button>
                        )}
                    </div>

                    {/* Book Now Button */}
                    {/* Disable button if no vehicle is selected/available */}
                    <button
                        className="book-now-button"
                        onClick={handleBookNow}
                        disabled={vehicles.length === 0 || currentIndex >= vehicles.length}
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
    // --- End Render JSX ---
}
// --- End Main Booking Page Component ---
