import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close, MyLocation } from '@mui/icons-material';
import { useGoogleMaps } from './GoogleMapsProvider';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 10.3157, // Cebu City
  lng: 123.8854,
};

const DraggableMapModal = ({ open, onClose, pickUp, dropOff, onLocationChange }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [localPickUp, setLocalPickUp] = useState(pickUp);
  const [localDropOff, setLocalDropOff] = useState(dropOff);
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);

  // Update local state when props change
  useEffect(() => {
    setLocalPickUp(pickUp);
    setLocalDropOff(dropOff);
  }, [pickUp, dropOff]);

  // Calculate map center
  const mapCenter = React.useMemo(() => {
    if (localPickUp?.latitude && localPickUp?.longitude) {
      return {
        lat: localPickUp.latitude,
        lng: localPickUp.longitude,
      };
    } else if (localDropOff?.latitude && localDropOff?.longitude) {
      return {
        lat: localDropOff.latitude,
        lng: localDropOff.longitude,
      };
    }
    return defaultCenter;
  }, [localPickUp, localDropOff]);

  // Fetch directions when both locations are available
  useEffect(() => {
    if (
      isLoaded &&
      localPickUp?.latitude &&
      localDropOff?.latitude &&
      window.google
    ) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: { lat: localPickUp.latitude, lng: localPickUp.longitude },
          destination: { lat: localDropOff.latitude, lng: localDropOff.longitude },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
          } else {
            console.warn('Directions not available');
            setDirections(null);
          }
        }
      );
    }
  }, [isLoaded, localPickUp, localDropOff]);

  // Handle marker drag for pickup
  const handlePickUpDrag = useCallback((e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    
    // Reverse geocode to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const newLocation = {
          address: results[0].formatted_address,
          latitude: newLat,
          longitude: newLng,
          placeId: results[0].place_id,
        };
        setLocalPickUp(newLocation);
      }
    });
  }, []);

  // Handle marker drag for dropoff
  const handleDropOffDrag = useCallback((e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    
    // Reverse geocode to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const newLocation = {
          address: results[0].formatted_address,
          latitude: newLat,
          longitude: newLng,
          placeId: results[0].place_id,
        };
        setLocalDropOff(newLocation);
      }
    });
  }, []);

  // Center map to user's current location
  const handleCenterToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (map) {
            map.panTo(pos);
            map.setZoom(15);
          }
        },
        () => {
          alert('Error: The Geolocation service failed.');
        }
      );
    } else {
      alert('Error: Your browser doesn\'t support geolocation.');
    }
  };

  // Save changes and close
  const handleSave = () => {
    onLocationChange(localPickUp, localDropOff);
    onClose();
  };

  // Cancel changes
  const handleCancel = () => {
    setLocalPickUp(pickUp);
    setLocalDropOff(dropOff);
    onClose();
  };

  if (loadError) {
    return (
      <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>Map Preview</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Failed to load Google Maps. Please check your internet connection.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!isLoaded) {
    return (
      <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>Map Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Adjust Location Pins
        </Typography>
        <IconButton onClick={handleCancel} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Drag the markers</strong> to adjust pick-up and drop-off locations
          </Alert>

          {/* Location Info */}
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                🟢 Pick-up Location:
              </Typography>
              <Typography variant="body2" sx={{ ml: 2 }}>
                {localPickUp?.address || 'Not set'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                🔴 Drop-off Location:
              </Typography>
              <Typography variant="body2" sx={{ ml: 2 }}>
                {localDropOff?.address || 'Not set'}
              </Typography>
            </Box>
          </Paper>

          {/* Google Map */}
          <Box sx={{ position: 'relative' }}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={13}
              onLoad={setMap}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: true,
              }}
            >
              {/* Draggable Pick-up Marker */}
              {localPickUp?.latitude && localPickUp?.longitude && (
                <Marker
                  position={{ lat: localPickUp.latitude, lng: localPickUp.longitude }}
                  draggable={true}
                  onDragEnd={handlePickUpDrag}
                  label={{
                    text: 'P',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  }}
                  title="Pick-up Location (Drag to move)"
                />
              )}

              {/* Draggable Drop-off Marker */}
              {localDropOff?.latitude && localDropOff?.longitude && (
                <Marker
                  position={{ lat: localDropOff.latitude, lng: localDropOff.longitude }}
                  draggable={true}
                  onDragEnd={handleDropOffDrag}
                  label={{
                    text: 'D',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  }}
                  title="Drop-off Location (Drag to move)"
                />
              )}

              {/* Directions Route */}
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#CA8787',
                      strokeWeight: 5,
                    },
                  }}
                />
              )}
            </GoogleMap>

            {/* Current Location Button */}
            <IconButton
              onClick={handleCenterToCurrentLocation}
              sx={{
                position: 'absolute',
                bottom: 120,
                right: 10,
                backgroundColor: 'white',
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <MyLocation />
            </IconButton>
          </Box>

          {/* Route Information */}
          {directions && (
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
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: '#CA8787',
            '&:hover': {
              backgroundColor: '#B57676',
            },
          }}
        >
          Save Locations
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DraggableMapModal;
