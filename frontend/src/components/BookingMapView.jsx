import React, { useMemo, useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { useGoogleMaps } from './GoogleMapsProvider';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 10.3157,  // Cebu City
  lng: 123.8854,
};

const BookingMapView = ({ pickUp, dropOff, showDirections = false }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [directions, setDirections] = useState(null);
  const [directionsError, setDirectionsError] = useState(null);

  // Calculate map center based on markers
  const mapCenter = useMemo(() => {
    if (pickUp?.latitude && pickUp?.longitude) {
      return {
        lat: pickUp.latitude,
        lng: pickUp.longitude,
      };
    } else if (dropOff?.latitude && dropOff?.longitude) {
      return {
        lat: dropOff.latitude,
        lng: dropOff.longitude,
      };
    }
    return defaultCenter;
  }, [pickUp, dropOff]);

  // Calculate appropriate zoom level
  const mapZoom = useMemo(() => {
    if (pickUp && dropOff) {
      return 12; // Show both markers
    } else if (pickUp || dropOff) {
      return 15; // Show single marker
    }
    return 13; // Default zoom for Cebu City
  }, [pickUp, dropOff]);

  // Fetch directions when both locations are available
  useEffect(() => {
    if (
      isLoaded &&
      showDirections &&
      pickUp?.latitude &&
      dropOff?.latitude &&
      window.google
    ) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: { lat: pickUp.latitude, lng: pickUp.longitude },
          destination: { lat: dropOff.latitude, lng: dropOff.longitude },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
            setDirectionsError(null);
          } else {
            // Silently fail - Directions API might not be enabled
            console.warn('Directions not available. Enable Directions API in Google Cloud Console.');
            setDirectionsError(null); // Don't show error to user
          }
        }
      );
    }
  }, [isLoaded, pickUp, dropOff, showDirections]);

  if (loadError) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Map</Typography>
          <Typography variant="body2">
            Failed to load Google Maps. Please check your API key and internet connection.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  if (!isLoaded) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Map...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Pick-up Location Marker */}
        {pickUp?.latitude && pickUp?.longitude && (
          <Marker
            position={{ lat: pickUp.latitude, lng: pickUp.longitude }}
            label={{
              text: 'P',
              color: 'white',
              fontWeight: 'bold',
            }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            }}
            title={pickUp.address || 'Pick-up Location'}
          />
        )}

        {/* Drop-off Location Marker */}
        {dropOff?.latitude && dropOff?.longitude && (
          <Marker
            position={{ lat: dropOff.latitude, lng: dropOff.longitude }}
            label={{
              text: 'D',
              color: 'white',
              fontWeight: 'bold',
            }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
            title={dropOff.address || 'Drop-off Location'}
          />
        )}

        {/* Directions Route */}
        {showDirections && directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // We're using custom markers
              polylineOptions: {
                strokeColor: '#CA8787',
                strokeWeight: 5,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Route Information */}
      {showDirections && directions && (
        <Paper sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="body2" fontWeight="bold">
            Route Information:
          </Typography>
          <Typography variant="body2">
            Distance: {directions.routes[0]?.legs[0]?.distance?.text}
          </Typography>
          <Typography variant="body2">
            Estimated Time: {directions.routes[0]?.legs[0]?.duration?.text}
          </Typography>
        </Paper>
      )}

      {/* Error displaying directions */}
      {showDirections && directionsError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {directionsError}
        </Alert>
      )}
    </Box>
  );
};

export default BookingMapView;
