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
    Divider,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Modal, // <-- Import Modal
    Dialog, // <-- More structured modal using Dialog
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Rating, // <-- Optional: Import Rating for star reviews
    Snackbar // <-- For brief success/error messages after review submit
} from '@mui/material';
import { AccountCircle, Email, School, Person, ArrowBack, CalendarToday, RateReview } from '@mui/icons-material'; // Import CalendarToday, RateReview
import './Profile.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8080";

// Helper to format raw digits "123456789" → "12-3456-789"
function formatSchoolId(value = "") {
    // ... (keep existing function)
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

    const [userBookings, setUserBookings] = useState([]);
    const [userBookingsLoading, setUserBookingsLoading] = useState(true);
    const [userBookingsError, setUserBookingsError] = useState(null);

    // --- NEW STATE FOR REVIEW MODAL ---
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewTargetBooking, setReviewTargetBooking] = useState(null); // Store the whole booking object
    const [reviewText, setReviewText] = useState('');
    // const [reviewRating, setReviewRating] = useState(0); // Optional: For star rating
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'
    // --- END NEW STATE ---

    // --- Effects (fetchUserData, fetchUserBookings) ---
    // ... (keep existing useEffect hooks)
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
                    setUserBookings(response.data); // Assume this returns an array of booking objects
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


    // --- Profile Edit Handlers (handleBackClick, handleEditClick, etc.) ---
    // ... (keep existing handlers)
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


    // --- NEW Review Modal Handlers ---
    const handleOpenReviewModal = (booking) => {
        setReviewTargetBooking(booking);
        setReviewText(''); // Reset fields when opening
        // setReviewRating(0); // Reset rating
        setReviewError(null); // Clear previous errors
        setIsReviewModalOpen(true);
    };

    const handleCloseReviewModal = () => {
        setIsReviewModalOpen(false);
        setReviewTargetBooking(null); // Clear target
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleReviewSubmit = async () => {
        if (!reviewTargetBooking || !reviewText.trim()) { // Basic validation
            setReviewError("Review text cannot be empty.");
            return;
        }
        setReviewSubmitting(true);
        setReviewError(null);
        const token = localStorage.getItem('token');

        if (!token) {
            setReviewError("Authentication token missing. Please log in again.");
            setReviewSubmitting(false);
            return;
        }

        // Construct the payload according to ReportController expectations
        const payload = {
            // Add other ReportEntity fields as needed (e.g., rating)
            // description: reviewText, // Assuming your ReportEntity has a 'description' field for the text
            // comment: reviewText // Or maybe 'comment'? Adjust field name as needed!
            reviewText: reviewText, // <<<--- ADJUST THIS FIELD NAME based on your ReportEntity.java
            // rating: reviewRating, // Optional: Add rating if you use it
            booking: {
                bookingID: reviewTargetBooking.bookingID // Send the booking ID within a booking object
            }
            // The backend will fetch the full booking, set the date, etc.
        };

        try {
            await axios.post(`${API_BASE_URL}/api/reviews`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSnackbarMessage('Review submitted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseReviewModal();

            // OPTIONAL: Update the UI to reflect the review submission
            // This is tricky without knowing if a review exists. The simplest way
            // is to just close the modal. A better way requires the backend
            // to indicate if a review exists for a booking.
            // Example: Refetch bookings or update the specific booking's state locally
            // setUserBookings(prevBookings =>
            //     prevBookings.map(b =>
            //         b.bookingId === reviewTargetBooking.bookingId
            //             ? { ...b, hasReview: true } // Needs 'hasReview' flag from backend
            //             : b
            //     )
            // );

        } catch (err) {
            console.error("Review submission failed:", err.response || err);
            const backendError = err.response?.data?.message || err.response?.data?.error;
            const errorMessage = backendError || err.message || "Failed to submit review.";
            // Display error inside the modal
            setReviewError(`Error: ${errorMessage}`);
            // Or use the snackbar for errors too
            // setSnackbarMessage(`Error: ${errorMessage}`);
            // setSnackbarSeverity('error');
            // setSnackbarOpen(true);
        } finally {
            setReviewSubmitting(false);
        }
    };
    // --- END Review Modal Handlers ---


    // --- Render Logic ---
    if (loading) {
        // ... (keep existing loading render)
        return (
            <div className="root">
                <Paper className="profile-paper" sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress size={80} />
                    <Typography variant="h6" sx={{ mt: 2 }}>Loading Profile...</Typography>
                </Paper>
            </div>
        );
    }

    if (error && !userData) {
        // ... (keep existing error render)
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

    return (
        <div className="root">
            <Paper className="profile-paper">
                {/* Back Button, Avatar, Name, Edit/View Logic */}
                {/* ... (keep existing profile section) ... */}
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
                        {/* ... Keep TextFields ... */}
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
                            disabled
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
                        {/* ... Keep Grid items ... */}
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
                <Divider sx={{ my: 4 }} />

                <Box sx={{ px: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarToday sx={{ mr: 1 }} />
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
                        <TableContainer component={Paper} variant="outlined">
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
                                        <TableCell align="right">Pass.</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell> {/* <-- NEW COLUMN HEADER */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userBookings.map((booking) => (
                                        <TableRow
                                            key={booking.bookingId} // Ensure bookingId is the correct key
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">{booking.bookingID}</TableCell>
                                            <TableCell>{booking.vehicle?.plateNumber || 'N/A'}</TableCell>
                                            <TableCell>{booking.pickUp || 'N/A'}</TableCell>
                                            <TableCell>{booking.dropOff || 'N/A'}</TableCell>
                                            <TableCell>{booking.requestDate ? new Date(booking.requestDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell align="right">{booking.numberOfPassengers}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: booking.status === 'Done' ? 'success.main' : booking.status === 'Cancelled' ? 'error.main' : 'text.secondary'
                                                    }}
                                                >
                                                    {booking.status}
                                                </Typography>
                                            </TableCell>
                                            {/* --- NEW ACTION CELL --- */}
                                            <TableCell>
                                                {/* --- CONDITIONALLY RENDER REVIEW BUTTON --- */}
                                                {/* Check if status is 'Done'. You might need to adjust the exact string 'Done' based on your backend enum/values */}
                                                {/* TODO: Add a check here if the booking already has a review, if that data is available */}
                                                {booking.status === 'Done' && (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<RateReview />}
                                                        onClick={() => handleOpenReviewModal(booking)}
                                                        // disabled={booking.hasReview} // Optional: Disable if already reviewed (needs 'hasReview' flag from backend)
                                                    >
                                                        Review
                                                        {/* {booking.hasReview ? 'Reviewed' : 'Review'} */}
                                                    </Button>
                                                )}
                                                {/* Add other potential actions here */}
                                            </TableCell>
                                            {/* --- END NEW ACTION CELL --- */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
                {/* --- END BOOKING HISTORY SECTION --- */}

            </Paper>

            {/* --- REVIEW MODAL DIALOG --- */}
            <Dialog open={isReviewModalOpen} onClose={handleCloseReviewModal} maxWidth="sm" fullWidth>
                <DialogTitle>Leave a Review</DialogTitle>
                <DialogContent>
                    {reviewTargetBooking && ( // Ensure booking data is loaded before showing details
                        <DialogContentText sx={{ mb: 2 }}>
                            Reviewing booking ID: {reviewTargetBooking.bookingID} for vehicle {reviewTargetBooking.vehicle?.plateNumber || 'N/A'}.
                        </DialogContentText>
                    )}

                    {/* Optional: Rating Component */}
                    {/* <Box sx={{ mb: 2 }}>
                        <Typography component="legend">Rating</Typography>
                        <Rating
                            name="booking-rating"
                            value={reviewRating}
                            onChange={(event, newValue) => {
                                setReviewRating(newValue);
                            }}
                        />
                    </Box> */}

                    <TextField
                        autoFocus
                        margin="dense"
                        id="review-text"
                        label="Your Review / Comments"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        error={!!reviewError && !reviewText.trim()} // Show error if reviewError exists and text is empty
                        helperText={!reviewText.trim() && reviewError ? reviewError : ''} // Show specific validation message
                    />
                    {/* Show general submission errors here */}
                    {reviewError && reviewText.trim() && (
                        <Alert severity="error" sx={{ mt: 2 }}>{reviewError}</Alert>
                    )}

                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseReviewModal} color="secondary">Cancel</Button>
                    <Button
                        onClick={handleReviewSubmit}
                        variant="contained"
                        disabled={reviewSubmitting || !reviewText.trim()} // Disable if submitting or text is empty
                    >
                        {reviewSubmitting ? <CircularProgress size={24} /> : 'Submit Review'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* --- END REVIEW MODAL --- */}

            {/* --- Snackbar for feedback --- */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000} // Hide after 4 seconds
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            {/* --- End Snackbar --- */}

        </div>
    );
}