import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom'; // for nested routes
import Header from './Header.jsx';
import LoggedInHeader from './HeaderLoggedIn.jsx'; // you need to create this next!

export default function Layout() {
    const token = localStorage.getItem('token'); // Or however you store the login info

    return (
        <Box>
            {/* Auto-switch Header */}
            {token ? <LoggedInHeader /> : <Header />}

            {/* Main Content */}
            <Box>
                <Outlet /> {/* Renders the child pages inside */}
            </Box>
        </Box>
    );
}