import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    AlertTitle,
    CircularProgress,
    Grid,
    Paper,
    Divider, // Import Divider
    TableContainer, // Import Table components
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material';
import { AccountCircle, Email, School, Person, ArrowBack, CalendarToday } from '@mui/icons-material'; // Import CalendarToday
import './Profile.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8080";

// Helper to format raw digits "123456789" → "12-3456-789"
function formatSchoolId(value = "") {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    const part1 = digits.slice(0, 2);
    const part2 = digits.slice(2, 6);
    const part3 = digits.slice(6, 9);
    let result = part1;
    if (part2) result += '-' + part2;
    if (part3) result += '-' + part3;
    return result;
}

export default function Profile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(null);

    // --- NEW STATE FOR BOOKING HISTORY ---
    const [userBookings, setUserBookings] = useState([]);
    const [userBookingsLoading, setUserBookingsLoading] = useState(true);
    const [userBookingsError, setUserBookingsError] = useState(null);
    // --- END NEW STATE ---


    // --- Effect to fetch user profile data ---
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Redirecting...');
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data;
                // Ensure schoolid is always treated as string initially, even if null/undefined from backend
                const rawSchoolId = data.schoolid ?? '';

                const mergedData = {
                    ...data,
                    // Assuming username is included, fallback to localStorage if necessary (though backend should return it)
                    username: data.username ?? (JSON.parse(localStorage.getItem('user'))?.username ?? ''),
                    schoolid: rawSchoolId // Keep the raw value
                };

                setUserData(mergedData);
                setEditedData({
                    firstName: mergedData.firstName || '',
                    lastName: mergedData.lastName || '',
                    username: mergedData.username,
                    email: mergedData.email || '',
                    // Format the initial schoolId for editing:
                    schoolId: formatSchoolId(rawSchoolId)
                });
            } catch (err) {
                const status = err.response?.status;
                if (status === 401) {
                    setError('Not authenticated. Redirecting...');
                    // Clear token on 401 to ensure clean state
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setError('Failed to fetch user profile.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]); // Add navigate to dependency array


    // --- NEW Effect to fetch user booking history ---
    // This effect runs ONLY after userData is successfully loaded
    useEffect(() => {
        // Only fetch bookings if userData is available (meaning user profile was loaded)
        if (userData) {
            const fetchUserBookings = async () => {
                setUserBookingsLoading(true);
                setUserBookingsError(null);
                const token = localStorage.getItem('token'); // Get token again, though it should exist if userData loaded

                // Ensure token exists (should be true if userData is loaded)
                if (!token) {
                    setUserBookingsError("Authentication token missing for booking history.");
                    setUserBookingsLoading(false);
                    return;
                }

                try {
                    // Call the new backend endpoint for user's bookings
                    // Make sure this endpoint exists and works!
                    // Using /api/bookings/my as the example path
                    const response = await axios.get(`${API_BASE_URL}/api/bookings/my`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserBookings(response.data);
                    setUserBookingsLoading(false);
                } catch (err) {
                    console.error("Error fetching user bookings:", err.response || err);
                    setUserBookingsError("Failed to load booking history.");
                    setUserBookingsLoading(false);
                }
            };

            fetchUserBookings();
        }
        // Dependency array: re-run this effect if userData changes (specifically if userid might change, though unlikely)
    }, [userData]);
    // --- END NEW Effect ---


    const handleBackClick = () => navigate(-1);
    const handleEditClick = () => setIsEditing(true);
    const handleCancelClick = () => {
        setIsEditing(false);
        // Reset edited data back to the current userData, using the raw schoolid for formatting
        setEditedData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || '',
            email: userData.email || '',
            schoolId: formatSchoolId(userData.schoolid)
        });
        setUpdateSuccess(null); // Clear success message on cancel
        setError(null); // Clear any main error message
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Only apply formatting to schoolId input
        if (name === 'schoolId') {
            setEditedData(prev => ({ ...prev, [name]: formatSchoolId(value) }));
        } else {
            setEditedData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setError(null); // Clear previous errors
        setUpdateSuccess(null); // Clear previous success

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found. Redirecting...');
            setUpdateLoading(false);
            navigate('/login');
            return;
        }

        try {
            // Strip dashes from schoolId before sending
            const payload = {
                // Only send fields allowed for update by the backend /users/me PUT endpoint
                // Assume backend handles username updates if allowed
                firstName: editedData.firstName,
                lastName: editedData.lastName,
                username: editedData.username, // Assuming username can be updated
                // email: editedData.email, // Email typically not updated via this endpoint
                schoolid: editedData.schoolId.replace(/-/g, '') // Send the raw number
            };

            const response = await axios.put(
                `${API_BASE_URL}/users/me`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Assuming the backend returns the updated user object in the response body
            const updatedUser = response.data; // Adjust based on your actual backend response structure

            // Update userData state with fetched updated data
            setUserData(prev => ({ ...prev, ...updatedUser, schoolid: updatedUser.schoolid ?? '' })); // Ensure schoolid is updated and is string

            setIsEditing(false);
            setUpdateSuccess('Profile updated successfully!');
            // Optionally update localStorage user details, but be careful about sensitive data
            // localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updatedUser })); // Example merge
        } catch (err) {
            console.error("Profile update failed:", err.response || err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile.';
            setError(errorMessage);
        } finally {
            setUpdateLoading(false);
        }
    };

    // Render loading state for initial profile fetch
    if (loading) {
        return (
            <div className="root">
                <Paper className="profile-paper" sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress size={80} />
                    <Typography variant="h6" sx={{ mt: 2 }}>Loading Profile...</Typography>
                </Paper>
            </div>
        );
    }

    // Render error state for initial profile fetch
    if (error && !userData) { // Only show main error if no user data loaded
        return (
            <div className="root">
                <Paper className="profile-paper" sx={{ p: 3 }}>
                    <Alert severity="error" variant="filled">
                        <AlertTitle>Error Loading Profile</AlertTitle>
                        {error}
                    </Alert>
                </Paper>
            </div>
        );
    }

    // Main Render (Profile and Booking History)
    return (
        <div className="root">
            <Paper className="profile-paper">
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBackClick}
                    sx={{ mb: 2, textTransform: 'none' }}
                >
                    Back
                </Button>

                {/* Avatar & Name */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <AccountCircle sx={{ fontSize: 80 }} />
                    <Typography variant="h4" sx={{ mt: 1 }}>
                        {userData?.firstName} {userData?.lastName} {/* Use optional chaining */}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        @{userData?.username} {/* Use optional chaining */}
                    </Typography>
                </Box>

                {updateSuccess && <Alert severity="success" sx={{ mb: 2 }}>{updateSuccess}</Alert>}
                {/* Show update error here if it occurs while editing */}
                {error && isEditing && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}


                {isEditing ? (
                    // --- EDITING FORM ---
                    <Box component="form" onSubmit={handleSubmit} sx={{ px: 3 }}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="First Name"
                            name="firstName"
                            value={editedData.firstName}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Last Name"
                            name="lastName"
                            value={editedData.lastName}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Username"
                            name="username"
                            value={editedData.username}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            name="email"
                            value={editedData.email}
                            disabled // Email typically not editable
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="School ID (xx-xxxx-xxx)"
                            name="schoolId"
                            value={editedData.schoolId}
                            onChange={handleInputChange}
                            placeholder="e.g., 12-3456-789" // Add placeholder for format
                        />

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button type="submit" variant="contained" disabled={updateLoading}>
                                {updateLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                            <Button onClick={handleCancelClick}>Cancel</Button>
                        </Box>
                    </Box>
                ) : (
                    // --- VIEWING PROFILE DETAILS ---
                    <Grid container direction="column" spacing={1} sx={{ px: 3 }}>
                        <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                            <Person sx={{ mr: 1 }} />
                            <Typography>Username: {userData?.username}</Typography> {/* Use optional chaining */}
                        </Grid>
                        <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                            <Email sx={{ mr: 1 }} />
                            <Typography>Email: {userData?.email}</Typography> {/* Use optional chaining */}
                        </Grid>
                        <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                            <School sx={{ mr: 1 }} />
                            <Typography>
                                School ID: {formatSchoolId(userData?.schoolid)} {/* Use optional chaining */}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button onClick={handleEditClick} sx={{ mt: 2 }}>
                                Edit Profile
                            </Button>
                        </Grid>
                    </Grid>
                )}

                {/* --- BOOKING HISTORY SECTION --- */}
                <Divider sx={{ my: 4 }} /> {/* Add a divider */}

                <Box sx={{ px: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarToday sx={{ mr: 1 }} /> {/* Icon for booking history */}
                        <Typography variant="h5">Booking History</Typography>
                    </Box>


                    {userBookingsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <CircularProgress size={30} />
                            <Typography variant="body1" sx={{ ml: 2 }}>Loading bookings...</Typography>
                        </Box>
                    ) : userBookingsError ? (
                        <Alert severity="error" sx={{ mt: 2 }}>{userBookingsError}</Alert>
                    ) : userBookings.length === 0 ? (
                        <Typography variant="body1" sx={{ mt: 2 }}>No booking history found.</Typography>
                    ) : (
                        <TableContainer component={Paper} variant="outlined"> {/* Use Paper with outline */}
                            <Table size="small" aria-label="user bookings table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Vehicle Plate</TableCell>
                                        <TableCell>Pick Up</TableCell>
                                        <TableCell>Drop Off</TableCell>
                                        <TableCell>Req Date</TableCell>
                                        <TableCell>Start Date</TableCell>
                                        <TableCell>End Date</TableCell>
                                        <TableCell align="right">Pass.</TableCell> {/* Abbreviated */}
                                        <TableCell>Status</TableCell>
                                        {/* Add Accepted/Completed Date columns if you want to show them */}
                                        {/* <TableCell>Accepted</TableCell> */}
                                        {/* <TableCell>Completed</TableCell> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userBookings.map((booking) => (
                                        <TableRow
                                            key={booking.bookingId}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">{booking.bookingId}</TableCell>
                                            {/* Access nested vehicle plate safely */}
                                            <TableCell>{booking.vehicle?.plateNumber || 'N/A'}</TableCell>
                                            <TableCell>{booking.pickUp || 'N/A'}</TableCell>
                                            <TableCell>{booking.dropOff || 'N/A'}</TableCell>
                                            {/* Format dates */}
                                            <TableCell>{booking.requestDate ? new Date(booking.requestDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell align="right">{booking.numberOfPassengers}</TableCell>
                                            <TableCell>{booking.status}</TableCell>
                                            {/* Display Accepted/Completed dates if included in backend response */}
                                            {/* <TableCell>{booking.acceptedAt ? new Date(booking.acceptedAt).toLocaleDateString() : 'N/A'}</TableCell> */}
                                            {/* <TableCell>{booking.completedAt ? new Date(booking.completedAt).toLocaleDateString() : 'N/A'}</TableCell> */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
                {/* --- END BOOKING HISTORY SECTION --- */}

            </Paper>
        </div>
    );
}