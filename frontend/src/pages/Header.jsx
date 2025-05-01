import React from 'react';
import { Box, Button, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import eduwheelsLogo from '/assets/eduwheels-logo.png'; // adjust if necessary
import './LandingPage/LandingPage.css'; // reusing your styles

export default function LandingHeader() {
    const handleSignUpClick = () => {
        window.location.href = '/signup';
    };

    const handleLoginClick = () => {
        window.location.href = '/login';
    };

    return (
        <Box className="top-bar-modern">
            <Link to="/" style={{ textDecoration: 'none' }}>
                <Avatar src={eduwheelsLogo} className="logo-modern" />
            </Link>
            <Box className="nav-links-modern">
                <Button color="inherit" component={Link} to="/about">About Us</Button>
                <Button color="inherit" component={Link} to="/booking">Book Now</Button>
                <Button color="inherit" component={Link} to="/contact">Contact Us</Button>
                <Button variant="outlined" color="primary" onClick={handleSignUpClick}>
                    Sign Up
                </Button>
                <Button variant="contained" color="primary" onClick={handleLoginClick}>
                    Login
                </Button>
            </Box>
        </Box>
    );
}