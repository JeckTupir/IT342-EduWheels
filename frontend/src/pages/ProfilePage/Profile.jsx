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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Rating,
    Snackbar,
    Avatar
} from '@mui/material';
import { AccountCircle, Email, School, Person, ArrowBack, CalendarToday, RateReview } from '@mui/icons-material';
import './Profile.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8080";

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

    const [userBookings, setUserBookings] = useState([]);
    const [userBookingsLoading, setUserBookingsLoading] = useState(true);
    const [userBookingsError, setUserBookingsError] = useState(null);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewTargetBooking, setReviewTargetBooking] = useState(null);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = 'info';

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
                const rawSchoolId = data.schoolid ?? '';

                const mergedData = {
                    ...data,
                    username: data.username ?? (JSON.parse(localStorage.getItem('user'))?.username ?? ''),
                    schoolid: rawSchoolId
                };

                setUserData(mergedData);
                setEditedData({
                    firstName: mergedData.firstName || '',
                    lastName: mergedData.lastName || '',
                    username: mergedData.username,
                    email: mergedData.email || '',
                    schoolId: formatSchoolId(rawSchoolId)
                });
            } catch (err) {
                const status = err.response?.status;
                if (status === 401) {
                    setError('Not authenticated. Redirecting...');
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
    }, [navigate]);

    useEffect(() => {
        if (userData) {
            const fetchUserBookings = async () => {
                setUserBookingsLoading(true);
                setUserBookingsError(null);
                const token = localStorage.getItem('token');

                if (!token) {
                    setUserBookingsError("Authentication token missing for booking history.");
                    setUserBookingsLoading(false);
                    return;
                }

                try {
                    const response = await axios.get(`${API_BASE_URL}/api/bookings/my`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserBookings(response.data);
                    setUserBookingsLoading(false);
                } catch (err) {
                    console.error("Error fetching user bookings with review status:", err.response || err);
                    setUserBookingsError("Failed to load booking history.");
                    setUserBookingsLoading(false);
                }
            };

            fetchUserBookings();
        }
    }, [userData]);

    const handleBackClick = () => navigate(-1);
    const handleEditClick = () => setIsEditing(true);
    const handleCancelClick = () => {
        setIsEditing(false);
        setEditedData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || '',
            email: userData.email || '',
            schoolId: formatSchoolId(userData.schoolid)
        });
        setUpdateSuccess(null);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'schoolId') {
            setEditedData(prev => ({ ...prev, [name]: formatSchoolId(value) }));
        } else {
            setEditedData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setError(null);
        setUpdateSuccess(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found. Redirecting...');
            setUpdateLoading(false);
            navigate('/login');
            return;
        }

        try {
            const payload = {
                firstName: editedData.firstName,
                lastName: editedData.lastName,
                username: editedData.username,
            };

            const response = await axios.put(
                `${API_BASE_URL}/users/me`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedUser = response.data;
            setUserData(prev => ({ ...prev, ...updatedUser, schoolid: updatedUser.schoolid ?? '' }));
            setIsEditing(false);
            setUpdateSuccess('Profile updated successfully!');
        } catch (err) {
            console.error("Profile update failed:", err.response || err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile.';
            setError(errorMessage);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleOpenReviewModal = (booking) => {
        setReviewTargetBooking(booking);
        setReviewText('');
        setReviewRating(0);
        setReviewError(null);
        setIsReviewModalOpen(true);
    };

    const handleCloseReviewModal = () => {
        setIsReviewModalOpen(false);
        setReviewTargetBooking(null);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleReviewSubmit = async () => {
        if (!reviewTargetBooking || !reviewText.trim()) {
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

        const payload = {
            rating: reviewRating,
            comment: reviewText,
            booking: {
                bookingID: reviewTargetBooking.bookingID
            }
        };

        try {
            await axios.post(`${API_BASE_URL}/api/reviews`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSnackbarMessage('Review submitted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseReviewModal();

            setUserBookings(prevBookings =>
                prevBookings.map(b =>
                    b.bookingID === reviewTargetBooking.bookingID
                        ? { ...b, hasReviewed: true }
                        : b
                )
            );

        } catch (err) {
            console.error("Review submission failed:", err.response || err);
            const backendError = err.response?.data?.message || err.response?.data?.error;
            const errorMessage = backendError || err.message || "Failed to submit review.";
            setReviewError(`Error: ${errorMessage}`);
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="root-profile">
                <Paper className="profile-paper-loading" sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress size={80} />
                    <Typography variant="h6" sx={{ mt: 2 }}>Loading Profile...</Typography>
                </Paper>
            </div>
        );
    }

    if (error && !userData) {
        return (
            <div className="root-profile">
                <Paper className="profile-paper-error" sx={{ p: 3 }}>
                    <Alert severity="error" variant="filled">
                        <AlertTitle>Error Loading Profile</AlertTitle>
                        {error}
                    </Alert>
                </Paper>
            </div>
        );
    }

    return (
        <div className="root-profile">
            <Paper className="profile-paper">
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBackClick}
                    sx={{ mb: 3, alignSelf: 'start', textTransform: 'none' }}
                >
                    Back to Dashboard
                </Button>

                {/* Profile Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}> {/* New Box to center Avatar */}
                        <Avatar sx={{ width: 100, height: 100, fontSize: 40, bgcolor: '#CA8787'}}>
                            {userData?.firstName?.charAt(0).toUpperCase()}
                            {userData?.lastName?.charAt(0).toUpperCase()}
                        </Avatar>
                    </Box>
                    <Typography variant="h4" className="profile-name" sx={{ mt: 1 }}>
                        {userData?.firstName} {userData?.lastName}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        @{userData?.username}
                    </Typography>
                </Box>

                {updateSuccess && <Alert severity="success" sx={{ mb: 2 }}>{updateSuccess}</Alert>}
                {error && isEditing && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Edit Profile Section */}
                {isEditing ? (
                    <Box component="form" onSubmit={handleSubmit} sx={{ px: 3, mt: 2 }}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="First Name"
                            name="firstName"
                            value={editedData.firstName}
                            onChange={handleInputChange}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Last Name"
                            name="lastName"
                            value={editedData.lastName}
                            onChange={handleInputChange}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Username"
                            name="username"
                            value={editedData.username}
                            onChange={handleInputChange}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            name="email"
                            value={editedData.email}
                            disabled
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="School ID (xx-xxxx-xxx)"
                            name="schoolId"
                            value={editedData.schoolId}
                            disabled
                            placeholder="e.g., 12-3456-789"
                            variant="outlined"
                        />

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button onClick={handleCancelClick}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary" disabled={updateLoading}>
                                {updateLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Grid container spacing={2} sx={{ px: 3, mt: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <Box className="info-item">
                                <Person className="info-icon" />
                                <Typography><span className="info-label">Username:</span> {userData?.username}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="info-item">
                                <Email className="info-icon" />
                                <Typography><span className="info-label">Email:</span> {userData?.email}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box className="info-item">
                                <School className="info-icon" />
                                <Typography><span className="info-label">School ID:</span> {formatSchoolId(userData?.schoolid)}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 10, textAlign: 'right' }}>
                            <Button onClick={handleEditClick} variant="outlined" color="primary">
                                Edit Profile
                            </Button>
                        </Grid>
                    </Grid>
                )}

                {/* Booking History Section */}
                <Divider sx={{ my: 4 }} />

                <Box sx={{ px: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarToday className="section-icon" sx={{ mr: 1 }} />
                        <Typography variant="h6" className="section-title">Booking History</Typography>
                    </Box>

                    {userBookingsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <CircularProgress size={30} />
                            <Typography variant="body1" sx={{ ml: 2, color: 'textSecondary' }}>Loading bookings...</Typography>
                        </Box>
                    ) : userBookingsError ? (
                        <Alert severity="error" sx={{ mt: 2 }}>{userBookingsError}</Alert>
                    ) : userBookings.length === 0 ? (
                        <Typography variant="body1" sx={{ mt: 2, color: 'textSecondary' }}>No booking history found.</Typography>
                    ) : (
                        <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <Table size="small" aria-label="user bookings table">
                                <TableHead sx={{ backgroundColor: '#f8f8f8' }}>
                                    <TableRow>
                                        <TableCell className="table-header-cell">ID</TableCell>
                                        <TableCell className="table-header-cell">Vehicle</TableCell>
                                        <TableCell className="table-header-cell">Pick Up</TableCell>
                                        <TableCell className="table-header-cell">Drop Off</TableCell>
                                        <TableCell className="table-header-cell">Req Date</TableCell>
                                        <TableCell className="table-header-cell">Start Date</TableCell>
                                        <TableCell className="table-header-cell">End Date</TableCell>
                                        <TableCell className="table-header-cell" align="right">Pass.</TableCell>
                                        <TableCell className="table-header-cell">Status</TableCell>
                                        <TableCell className="table-header-cell">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userBookings.map((booking) => (
                                        <TableRow
                                            key={booking.bookingID}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row" className="table-cell">{booking.bookingID}</TableCell>
                                            <TableCell className="table-cell">{booking.vehicle?.plateNumber || 'N/A'}</TableCell>
                                            <TableCell className="table-cell">{booking.pickUp || 'N/A'}</TableCell>
                                            <TableCell className="table-cell">{booking.dropOff || 'N/A'}</TableCell>
                                            <TableCell className="table-cell">{booking.requestDate ? new Date(booking.requestDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell className="table-cell">{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell className="table-cell">{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell className="table-cell" align="right">{booking.numberOfPassengers}</TableCell>
                                            <TableCell className="table-cell">
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
                                            <TableCell className="table-cell">
                                                {booking.status === 'Done' && !booking.hasReviewed && (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<RateReview />}
                                                        onClick={() => handleOpenReviewModal(booking)}
                                                        className="review-button"
                                                    >
                                                        Review
                                                    </Button>
                                                )}
                                                {booking.hasReviewed && (
                                                    <Typography variant="caption" color="textSecondary">Reviewed</Typography>
                                                )}
                                            </TableCell>
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
                <DialogTitle className="dialog-title">Leave a Review</DialogTitle>
                <DialogContent>
                    {reviewTargetBooking && (
                        <DialogContentText sx={{ mb: 2 }} className="dialog-content-text">
                            Reviewing booking ID: {reviewTargetBooking.bookingID} for vehicle {reviewTargetBooking.vehicle?.plateNumber || 'N/A'}.
                        </DialogContentText>
                    )}

                    <Box sx={{ mb: 2 }}>
                        <Typography component="legend" className="rating-label">Rating</Typography>
                        <Rating
                            name="booking-rating"
                            value={reviewRating}
                            onChange={(event, newValue) => {
                                setReviewRating(newValue);
                            }}
                            className="rating-component"
                        />
                    </Box>

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
                        error={!!reviewError && !reviewText.trim()}
                        helperText={!reviewText.trim() && reviewError ? reviewError : ''}
                        className="review-text-field"
                    />
                    {reviewError && reviewText.trim() && (
                        <Alert severity="error" sx={{ mt: 2 }} className="review-error-alert">{reviewError}</Alert>
                    )}

                </DialogContent>
                <DialogActions sx={{ p: 2 }} className="dialog-actions">
                    <Button onClick={handleCloseReviewModal} color="secondary">Cancel</Button>
                    <Button
                        onClick={handleReviewSubmit}
                        variant="contained"
                        color="primary"
                        disabled={reviewSubmitting || !reviewText.trim() || reviewRating === 0}
                        className="submit-review-button"
                    >
                        {reviewSubmitting ? <CircularProgress size={24} /> : 'Submit Review'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* --- END REVIEW MODAL --- */}

            {/* --- Snackbar for feedback --- */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
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