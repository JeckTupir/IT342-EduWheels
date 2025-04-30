import React from "react";
import { Box, Typography, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Divider } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import eduwheelsLogo from '/assets/bus-logo.png';
import './AdminDashboardPage.css';
import { Link, useNavigate, Outlet } from 'react-router-dom';

const drawerWidth = 240;

export default function AdminDashboardPage() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleLogout = () => {
        // Implement your logout logic here
        console.log("Logout clicked");
        navigate('/login'); // Redirect to login page after logout
    };

    const drawer = (
        <div>
            <Toolbar className="toolbar-logo">
                <Avatar src={eduwheelsLogo} alt="EduWheels Logo" className="logo-admin" />
                <Typography variant="h5" noWrap className="logo-text">
                    EduWheels
                </Typography>
            </Toolbar>
            <List>
                <ListItem button component={Link} to="/admin/dashboard" className="nav-item">
                    <ListItemIcon><DashboardIcon sx={{ color: '#5A4040' }} className="nav-icon" /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={Link} to="/admin/vehicles" className="nav-item">
                    <ListItemIcon><DirectionsBusIcon sx={{ color: '#5A4040' }} className="nav-icon" /></ListItemIcon>
                    <ListItemText primary="Vehicles" />
                </ListItem>
                <ListItem button component={Link} to="/admin/bookings" className="nav-item">
                    <ListItemIcon><CalendarTodayIcon sx={{ color: '#5A4040' }} className="nav-icon" /></ListItemIcon>
                    <ListItemText primary="Bookings" />
                </ListItem>
                <ListItem button component={Link} to="/admin/reviews" className="nav-item">
                    <ListItemIcon><RateReviewIcon sx={{ color: '#5A4040' }} className="nav-icon" /></ListItemIcon>
                    <ListItemText primary="Reviews" />
                </ListItem>
                <ListItem button component={Link} to="/admin/reports" className="nav-item">
                    <ListItemIcon><AssessmentIcon sx={{ color: '#5A4040' }} color="#5A4040" className="nav-icon" /></ListItemIcon>
                    <ListItemText primary="Report" />
                </ListItem>
                <ListItem button component={Link} to="/admin/users" className="nav-item">
                    <ListItemIcon><PersonIcon sx={{ color: '#5A4040' }} className="nav-icon" /></ListItemIcon>
                    <ListItemText primary="Users" />
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem button onClick={handleLogout} className="nav-item logout-button">
                    <ListItemIcon><LogoutIcon className="nav-icon logout-icon" /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }} className="admin-dashboard-page">
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: '#5A4040', // Matching top bar color
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Admin Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                <Outlet /> {/* This is where the content of the specific admin page will be rendered */}
            </Box>
        </Box>
    );
}