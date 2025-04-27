import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.jsx';
import CompleteProfilePage from './pages/SignUpPage/CompleteProfilePage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import LoggedIn from './pages/LandingPage/LoggedInPage.jsx';
import Profile from './pages/ProfilePage/Profile.jsx';
import Booking from './pages/BookingPage/BookingPage.jsx';
import AdminDashboard from './pages/AdminDashboardPage/AdminDashboardPage.jsx';
import AdminVehicles from './pages/AdminDashboardPage/AdminVehiclesPage.jsx';
import AdminBookings from './pages/AdminDashboardPage/AdminBookingsPage.jsx';
// import AdminReviews from './pages/AdminDashboardPage/AdminReviewsPage.jsx';
// import AdminReports from './pages/AdminDashboardPage/AdminReportsPage.jsx';
import AdminUsers from './pages/AdminDashboardPage/AdminUsersPage.jsx';
import OAuthCallbackHandler from './pages/Handler/OAuthCallbackHandler.jsx';
import Layout from './pages/Layout.jsx'; // <-- IMPORTANT: import the Layout

const RoutesComponent = () => {
    return (
        <Router basename="/eduwheels">
            <Routes>
                {/* Layout will wrap the public and user pages */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="logged-in" element={<LoggedIn />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="booking" element={<Booking />} />
                    <Route path="oauth2/callback" element={<OAuthCallbackHandler />} />
                </Route>

                <Route path="signup" element={<SignUpPage />} />
                <Route path="complete-profile" element={<CompleteProfilePage />} />
                <Route path="login" element={<LoginPage />} />

                {/* Admin section - no layout */}
                <Route path="/admin" element={<AdminDashboard />}>
                    <Route path="dashboard" element={<div>Welcome to the Dashboard Content</div>} />
                    <Route path="vehicles" element={<AdminVehicles />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    {/* <Route path="reviews" element={<AdminReviews />} /> */}
                    {/* <Route path="reports" element={<AdminReports />} /> */}
                    <Route path="users" element={<AdminUsers />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default RoutesComponent;
