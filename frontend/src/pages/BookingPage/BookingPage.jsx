import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../HeaderLoggedIn';
import axios from 'axios';
import './BookingPage.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Leaflet Icon Setup ---
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

function LocationPicker({ setAddress, addressType }) {
    useMapEvents({
        click: (e) => {
            setAddress(prev => ({ ...prev, [addressType]: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}` }));
        },
    });
    return null;
}

export default function BookingPage() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [addresses, setAddresses] = useState({ pickup: '', dropoff: '' });
    const [showPickupMap, setShowPickupMap] = useState(false);
    const [showDropoffMap, setShowDropoffMap] = useState(false);
    const [passengers, setPassengers] = useState(1);
    const mapRef = useRef(null);
    const defaultCenter = [10.2914, 123.8943];
    const defaultZoom = 13;

    const getImageUrl = (path) => {
        if (!path) return null;
        const filename = path.replace(/^\/?uploads\//, '');
        if (!filename || filename.includes('/')) return null;
        return `https://it342-eduwheels.onrender.com/api/vehicles/uploads/${filename}`;
    };

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get("https://it342-eduwheels.onrender.com/api/vehicles");
                let availableVehicles = response.data.filter(vehicle => vehicle.status === "Available" && vehicle.capacity >= passengers);
                availableVehicles.sort((a, b) => (a.availableSeats ?? a.capacity) - (b.availableSeats ?? b.capacity));
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

    const handleBookNow = async () => {
        if (!vehicles[currentIndex]) {
            alert("No vehicle selected.");
            return;
        }
        if (!addresses.pickup || !addresses.dropoff) {
            alert("Please select both pick-up and drop-off locations.");
            return;
        }
        if (passengers <= 0 || passengers > vehicles[currentIndex].capacity) {
            alert(`Please enter a valid number of passengers (1-${vehicles[currentIndex].capacity}).`);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Authentication required. Please log in.");
            navigate('/login');
            return;
        }

        const bookingData = {
            plateNumber: vehicles[currentIndex].plateNumber,
            pickUp: addresses.pickup,
            dropOff: addresses.dropoff,
            requestDate: new Date().toISOString(),
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
            status: "Pending",
            numberOfPassengers: passengers
        };

        try {
            await axios.post("https://it342-eduwheels.onrender.com/api/bookings", bookingData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            alert("Booking successful!");
            navigate("/profile");
        } catch (error) {
            console.error("Error creating booking:", error);
            alert(`Failed to create booking: ${error.message}`);
        }
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? vehicles.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === vehicles.length - 1 ? 0 : prevIndex + 1));
    };

    const closePickupMap = () => setShowPickupMap(false);
    const closeDropoffMap = () => setShowDropoffMap(false);

    return (
        <div className="booking-root">
            {/*<Header />*/}
            <div className="booking-container">
                <div className="booking-form-section">
                    <h2>Book Your Ride</h2>
                    <div className="form-group">
                        <label htmlFor="pickup-address">Pick-up Location</label>
                        <div className="map-input-group">
                            <input
                                type="text"
                                id="pickup-address"
                                value={addresses.pickup}
                                placeholder="Select on map"
                                readOnly
                            />
                            <button type="button" onClick={() => setShowPickupMap(true)}>
                                {addresses.pickup ? 'Change Pickup' : 'Select Pickup'}
                            </button>
                        </div>
                        {showPickupMap && (
                            <div className="map-modal">
                                <h3>Select Pickup Location</h3>
                                <MapContainer
                                    ref={mapRef}
                                    center={defaultCenter}
                                    zoom={defaultZoom}
                                    style={{ height: '300px', width: '100%' }}
                                    whenCreated={mapInstance => { mapRef.current = mapInstance; }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {addresses.pickup && (
                                        <Marker position={addresses.pickup.split(', ').map(Number)}>
                                            <Popup>Pickup Location</Popup>
                                        </Marker>
                                    )}
                                    <LocationPicker setAddress={setAddresses} addressType="pickup" />
                                </MapContainer>
                                <button type="button" onClick={closePickupMap}>Confirm Pickup</button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="dropoff-address">Drop-off Location</label>
                        <div className="map-input-group">
                            <input
                                type="text"
                                id="dropoff-address"
                                value={addresses.dropoff}
                                placeholder="Select on map"
                                readOnly
                            />
                            <button type="button" onClick={() => setShowDropoffMap(true)}>
                                {addresses.dropoff ? 'Change Dropoff' : 'Select Dropoff'}
                            </button>
                        </div>
                        {showDropoffMap && (
                            <div className="map-modal">
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
                                <button type="button" onClick={closeDropoffMap}>Confirm Dropoff</button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="passengers">Number of Passengers</label>
                        <input
                            type="number"
                            id="passengers"
                            min="1"
                            value={passengers}
                            onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                            placeholder="Enter number of passengers"
                        />
                    </div>
                </div>

                <div className="vehicle-selection-section">
                    <h2>Available Vehicles</h2>
                    {vehicles.length > 0 ? (
                        <div className="vehicle-carousel">
                            <button
                                type="button"
                                className="carousel-control prev"
                                onClick={handlePrev}
                                disabled={vehicles.length <= 1}
                            >
                                &lt;
                            </button>
                            <div className="vehicle-card">
                                <img
                                    src={getImageUrl(vehicles[currentIndex]?.photoPath)}
                                    alt={vehicles[currentIndex]?.name || vehicles[currentIndex]?.type || 'Vehicle'}
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x200/cccccc/ffffff?text=No+Image"; }}
                                    className="vehicle-image"
                                />
                                <div className="vehicle-details">
                                    <h3>{vehicles[currentIndex]?.vehicleName || vehicles[currentIndex]?.name || vehicles[currentIndex]?.type || 'Vehicle'}</h3>
                                    <p>Capacity: {vehicles[currentIndex]?.capacity} passengers</p>
                                    <p>Available Seats: {vehicles[currentIndex]?.availableSeats ?? vehicles[currentIndex]?.capacity}</p>
                                    <p>Plate Number: {vehicles[currentIndex]?.plateNumber}</p>
                                </div>
                                <button type="button" className="book-button" onClick={handleBookNow}>
                                    Book This Vehicle
                                </button>
                            </div>
                            <button
                                type="button"
                                className="carousel-control next"
                                onClick={handleNext}
                                disabled={vehicles.length <= 1}
                            >
                                &gt;
                            </button>
                        </div>
                    ) : (
                        <p>No vehicles available for the selected number of passengers.</p>
                    )}
                </div>
            </div>
        </div>
    );
}