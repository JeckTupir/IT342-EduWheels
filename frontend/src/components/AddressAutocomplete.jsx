import React, { useRef, useEffect, useState } from 'react';
import { TextField, CircularProgress, Box, Typography } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useGoogleMaps } from './GoogleMapsProvider';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  label, 
  placeholder,
  error,
  helperText,
  required = false 
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value?.address || '');

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      // Initialize Google Places Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: 'ph' }, // Restrict to Philippines
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
          types: ['geocode', 'establishment'], // Allow both addresses and places
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();

        if (!place.geometry) {
          console.error('No geometry for place:', place);
          return;
        }

        // Extract address components
        const components = {
          street: '',
          city: '',
          region: '',
          country: '',
          postalCode: '',
        };

        place.address_components?.forEach((component) => {
          const types = component.types;
          if (types.includes('street_number') || types.includes('route')) {
            components.street += component.long_name + ' ';
          } else if (types.includes('locality')) {
            components.city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            components.region = component.long_name;
          } else if (types.includes('country')) {
            components.country = component.long_name;
          } else if (types.includes('postal_code')) {
            components.postalCode = component.long_name;
          }
        });

        // Create location object
        const location = {
          address: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          placeId: place.place_id,
          components: components,
        };

        setInputValue(place.formatted_address);
        onChange(location);
      });
    }
  }, [isLoaded, onChange]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // If user clears the input, reset the location
    if (e.target.value === '') {
      onChange(null);
    }
  };

  if (loadError) {
    return (
      <TextField
        fullWidth
        label={label}
        placeholder="Error loading Google Maps"
        disabled
        error
        helperText="Failed to load address autocomplete"
      />
    );
  }

  if (!isLoaded) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading address search...</Typography>
      </Box>
    );
  }

  return (
    <TextField
      inputRef={inputRef}
      fullWidth
      label={label}
      placeholder={placeholder || 'Start typing an address...'}
      value={inputValue}
      onChange={handleInputChange}
      error={error}
      helperText={helperText || 'Type and select from suggestions'}
      required={required}
      InputProps={{
        startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset': {
            borderColor: 'primary.main',
          },
        },
      }}
    />
  );
};

export default AddressAutocomplete;
