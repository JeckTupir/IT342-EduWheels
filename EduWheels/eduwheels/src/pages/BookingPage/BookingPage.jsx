// BookingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../HeaderLoggedIn';
import axios from 'axios';
import './BookingPage.css'; // Your page-specific CSS

import { ArrowBackIosNew } from '@mui/icons-material';

export default function BookingPage() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]); // <-- vehicles from backend

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/vehicles");
                const availableVehicles = response.data.filter(vehicle => vehicle.status === "Available");
                setVehicles(availableVehicles);
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            }
        };

        fetchVehicles();
    }, []);

    const handleBookNow = () => {
        alert('Booking functionality coming soon!');
    };

    return (
        <div className="booking-root">
            <div className="booking-container">
                <div className="booking-info">
                    <h2>Booking Info</h2>
                    <p>Please select your booking details</p>

                    <div className="booking-form">
                        <div className="booking-form-group">
                            <label>Pick - Up</label>
                            <input type="text" placeholder="Enter your Address"/>
                            <small>Choose in Maps ⓘ</small>
                        </div>
                        <div className="booking-form-group">
                            <label>Drop - Off</label>
                            <input type="text" placeholder="Enter your Address" />
                            <small>Choose in Maps ⓘ</small>
                        </div>
                    </div>
                </div>

                <div className="booking-recommendation">
                    <h3>Available Vehicles</h3>
                    <p>The vehicles automatically change depending on their capacity and availability.</p>

                    <div className="vehicle-carousel">
                        {vehicles.length > 0 ? (
                            vehicles.map((vehicle, index) => (
                                <div
                                    key={index}
                                    className={`vehicle-card ${vehicle.recommended ? 'recommended' : ''}`}
                                >
                                    <img
                                        src={`http://localhost:8080/api/vehicles/uploads/${vehicle.photoPath}`}
                                        alt={vehicle.type}
                                        // onError={(e) => { e.target.src = "/images/default-bus.png"; }} // fallback image
                                    />
                                    <h4>{vehicle.type}</h4>
                                    <p>Capacity: {vehicle.capacity}</p>
                                    <p>Plate Number: {vehicle.plateNumber}</p>
                                </div>
                            ))
                        ) : (
                            <p>No available vehicles at the moment.</p>
                        )}
                    </div>

                    <button className="book-now-button" onClick={handleBookNow}>
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
