import React, { useState, useEffect } from 'react';
import { Box, Button, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import eduwheelsLogo from '/assets/eduwheels-logo.png';
import './LandingPage/LandingPage.css';

export default function HeaderLoggedIn() {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserRole(parsedUser.role);
        }
    }, []);

    const handleProfileClick = () => {
        window.location.href = '/eduwheels/profile';
    };

    const handleLogoutClick = () => {
        localStorage.clear();
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

                {/* 🛡️ Only show Admin Dashboard if userRole is Admin */}
                {userRole === 'Admin' && (
                    <Button color="inherit" component={Link} to="/admin">
                        Admin Dashboard
                    </Button>
                )}

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
