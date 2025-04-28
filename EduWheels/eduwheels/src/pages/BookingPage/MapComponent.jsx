import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons not appearing (often needed with Webpack/Parcel)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerRetina,
    iconUrl: markerIcon,
    shadowUrl: shadowUrl
});

const MapComponent = () => {
    const position = [10.2914, 123.8943]; // Coordinates near CIT-U, Cebu City
    const zoomLevel = 15; // Increased zoom for a closer view

    return (
        <MapContainer center={position} zoom={zoomLevel} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    Cebu Institute of Technology - University
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapComponent;