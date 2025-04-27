// Header.jsx
import React from 'react';
import { Box, Button, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import eduwheelsLogo from '/assets/eduwheels-logo.png'; // use correct path
import './LandingPage/LandingPage.css'; // Reuse same styling

export default function HeaderLoggedIn() {
    const handleProfileClick = () => {
        window.location.href = '/profile';
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
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
                <Button variant="outlined" color="primary" onClick={handleProfileClick}>
                    <AccountCircleOutlinedIcon />
                    Profile
                </Button>
                <Button variant="contained" color="primary" onClick={handleLogoutClick}>
                    <LogoutIcon />
                    Log Out
                </Button>
            </Box>
        </Box>
    );
}
