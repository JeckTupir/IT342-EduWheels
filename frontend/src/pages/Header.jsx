import React from 'react';
import { Box, Button, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import eduwheelsLogo from '/assets/eduwheels-logo.png'; // adjust if necessary
import './LandingPage/LandingPage.css'; // reusing your styles

export default function LandingHeader() {

    return (
        <Box className="top-bar-modern">
            <Link to="/" style={{ textDecoration: 'none' }}>
                <img src={eduwheelsLogo}  className="logo-modern" alt="EduWheels Logo"/>
            </Link>
            <Box className="nav-links-modern">
                <Button color="inherit" component={Link} to="/about">About Us</Button>
                <Button color="inherit" component={Link} to="/booking">Book Now</Button>
                <Button color="inherit" component={Link} to="/contact">Contact Us</Button>
                <Button variant="outlined" color="primary" component={Link} to="/signup">
                    Sign Up
                </Button>
                <Button variant="contained" color="primary" component={Link} to="/login">
                    Login
                </Button>
            </Box>
        </Box>
    );
}