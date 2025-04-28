// src/pages/Admin/AdminBookingsPage.jsx
import React, { useEffect, useState, useCallback } from 'react'; // Import useCallback
import axios from 'axios';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    AlertTitle, // Import AlertTitle
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Select,
    MenuItem,
    FormControl,
    IconButton,
    Snackbar,
    Dialog, // Import Dialog components for confirmation
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField, // Import TextField for search
    InputAdornment, // Import InputAdornment for search icon
    TablePagination, // Import TablePagination
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // Keep Edit Icon import
import SearchIcon from '@mui/icons-material/Search'; // Import Search Icon
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Import Error Icon

// Helper function for Snackbar alerts
const AlertSnackbar = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const API_BASE_URL = 'http://localhost:8080'; // Define base URL

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true); // For initial fetch
    const [mutationLoading, setMutationLoading] = useState(false); // For status updates/deletes
    const [error, setError] = useState(null); // For fetch errors
    const [statusUpdateMessage, setStatusUpdateMessage] = useState({ open: false, text: '', severity: 'success' });

    // --- State for Delete Confirmation Dialog ---
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null); // Store booking ID to delete
    // --- End Delete Confirmation Dialog State ---

    // --- State for Filtering and Pagination ---
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
    // --- End Filtering and Pagination State ---


    // Fetch bookings data from the backend (using useCallback for stability)
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null); // Clear previous fetch errors
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authentication token not found. Please log in.");
            setLoading(false);
            // Optionally redirect to login if token is missing
            // navigate('/login'); // Requires useNavigate hook
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setBookings(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching bookings:", err.response || err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to load bookings. Please try again.";
            setError(errorMessage);
            setLoading(false);
        }
    }, []); // No dependencies, so this function is created once

    // Effect to run the fetch operation on component mount
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]); // Dependency array includes fetchBookings


    // Handle status change from the dropdown
    const handleStatusChange = async (bookingID, newStatus) => {
        // Prevent multiple mutations at once
        if (mutationLoading) return;

        // Find the booking in the current state to get its existing data
        const bookingToUpdate = bookings.find(booking => booking.bookingID === bookingID);

        if (!bookingToUpdate) {
            console.error(`Booking with ID ${bookingID} not found in state.`);
            setStatusUpdateMessage({ open: true, text: `Error: Booking ${bookingID} not found in list.`, severity: 'error' });
            return;
        }

        // Prevent unnecessary update if status is the same
        if (bookingToUpdate.status === newStatus) {
            return;
        }

        setMutationLoading(true); // Start mutation loading

        // Construct the data payload for the PUT request
        // Ensure you send the necessary fields that your backend update endpoint expects.
        // Based on your BookingService.updateBooking, it expects a full BookingEntity body.
        // Make sure to include the user and vehicle IDs if your backend needs them to link the booking.
        const updatedBookingData = {
            // Copy existing fields
            bookingID: bookingToUpdate.bookingID, // Include ID in body if backend expects it
            startDate: bookingToUpdate.startDate,
            endDate: bookingToUpdate.endDate,
            numberOfPassengers: bookingToUpdate.numberOfPassengers,
            pickUp: bookingToUpdate.pickUp,
            dropOff: bookingToUpdate.dropOff,
            requestDate: bookingToUpdate.requestDate,
            acceptedAt: bookingToUpdate.acceptedAt, // Include existing timestamps
            completedAt: bookingToUpdate.completedAt, // Include existing timestamps

            // Include User and Vehicle IDs if backend requires them in the PUT body
            // Adjust field names based on your BookingEntity structure (e.g., userId, vehicleId or nested objects)
            userId: bookingToUpdate.user?.userId, // Assuming user object has userId
            vehicleId: bookingToUpdate.vehicle?.vehicleId, // Assuming vehicle object has vehicleId
            // If backend expects nested objects:
            // user: bookingToUpdate.user ? { userId: bookingToUpdate.user.userId } : null,
            // vehicle: bookingToUpdate.vehicle ? { vehicleId: bookingToUpdate.vehicle.vehicleId } : null,


            // --- The field being updated ---
            status: newStatus,
        };


        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setStatusUpdateMessage({ open: true, text: "Authentication token missing.", severity: 'error' });
                setMutationLoading(false);
                return;
            }

            const response = await axios.put(`${API_BASE_URL}/api/bookings/${bookingID}`, updatedBookingData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update the state with the response data (backend should return the updated entity)
            setBookings(bookings.map(booking =>
                booking.bookingId === bookingID ? response.data : booking // Replace the old booking object with the updated one
            ));
            setStatusUpdateMessage({ open: true, text: `Booking ${bookingID} status updated to ${newStatus}`, severity: 'success' });

        } catch (err) {
            console.error("Error updating booking status:", err.response || err);
            const errorMessage = err.response?.data?.message || err.message || `Failed to update booking ${bookingID} status.`;
            setStatusUpdateMessage({ open: true, text: errorMessage, severity: 'error' });
            // Optionally re-fetch all bookings to revert the change on failure
            // fetchBookings();
        } finally {
            setMutationLoading(false); // End mutation loading
        }
    };

    // --- Handle Delete Confirmation Dialog ---
    const handleOpenDeleteConfirm = (booking) => {
        setBookingToDelete(booking); // Store the booking object for name/ID
        setOpenDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setOpenDeleteConfirm(false);
        setBookingToDelete(null); // Clear the stored booking
    };

    // --- Handle Booking Deletion (after confirmation) ---
    const handleDeleteBooking = async () => {
        if (!bookingToDelete || mutationLoading) return; // Prevent deletion if no booking selected or already mutating

        const idToDelete = bookingToDelete.bookingID;

        setMutationLoading(true); // Start mutation loading
        setStatusUpdateMessage({ open: false, text: '', severity: 'success' }); // Clear previous messages

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setStatusUpdateMessage({ open: true, text: "Authentication token missing.", severity: 'error' });
                setMutationLoading(false);
                handleCloseDeleteConfirm();
                return;
            }

            // Send DELETE request to the backend
            await axios.delete(`${API_BASE_URL}/api/bookings/${idToDelete}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Remove the deleted booking from the state to update the UI
            setBookings(bookings.filter(booking => booking.bookingId !== idToDelete));

            setStatusUpdateMessage({ open: true, text: `Booking ${idToDelete} deleted successfully.`, severity: 'success' });
            handleCloseDeleteConfirm(); // Close dialog on success

        } catch (err) {
            console.error("Error deleting booking:", err.response || err);
            const errorMessage = err.response?.data?.message || err.message || `Failed to delete booking ${idToDelete}.`;
            setStatusUpdateMessage({ open: true, text: errorMessage, severity: 'error' });
            handleCloseDeleteConfirm(); // Close dialog even on error
        } finally {
            setMutationLoading(false); // End mutation loading
        }
    };
    // --- End Handle Booking Deletion ---


    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setStatusUpdateMessage({ ...statusUpdateMessage, open: false });
    };

    // --- Pagination Handlers ---
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset page to 0 when rows per page changes
    };
    // --- End Pagination Handlers ---

    // --- Filtering Logic ---
    const filteredBookings = bookings.filter((booking) => {
        const searchLower = searchTerm.toLowerCase();
        // Check if any relevant field includes the search term
        return (
            booking.bookingId?.toString().includes(searchLower) || // Search by ID (as string)
            booking.user?.email?.toLowerCase().includes(searchLower) || // Search by User Email
            booking.vehicle?.plateNumber?.toLowerCase().includes(searchLower) || // Search by Vehicle Plate
            booking.pickUp?.toLowerCase().includes(searchLower) || // Search by Pick Up
            booking.dropOff?.toLowerCase().includes(searchLower) || // Search by Drop Off
            booking.status?.toLowerCase().includes(searchLower) // Search by Status
            // Add other fields if needed (e.g., vehicle name, user name)
        );
    });
    // --- End Filtering Logic ---

    // Apply pagination to filtered results
    const paginatedBookings = filteredBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


    // --- Render ---
    return (
        <Box sx={{ padding: { xs: 1, sm: 2, md: 3 } }}> {/* Responsive padding */}
            <Typography variant="h4" gutterBottom>
                Manage Bookings
            </Typography>

            {/* Display general fetch errors */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorOutlineIcon />}>
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            )}

            {/* Search Input */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search Bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: { xs: '100%', sm: '300px' } }} // Responsive width
                />
            </Box>


            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ ml: 2 }}>Loading Bookings...</Typography>
                </Box>
            ) : bookings.length === 0 && !searchTerm ? ( // Show "No bookings" only if no search term
                <Typography variant="h6" sx={{ mt: 4 }}>No bookings found.</Typography>
            ) : filteredBookings.length === 0 && searchTerm ? ( // Show "No results" if searching but no results
                <Typography variant="h6" sx={{ mt: 4 }}>No results found for "{searchTerm}".</Typography>
            ) : (
                <Paper> {/* Wrap table in Paper for styling */}
                    <TableContainer>
                        <Table sx={{ minWidth: 800 }} aria-label="admin bookings table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>User Email</TableCell>
                                    <TableCell>Vehicle Plate</TableCell>
                                    <TableCell>Pick Up</TableCell>
                                    <TableCell>Drop Off</TableCell>
                                    <TableCell>Request Date</TableCell>
                                    <TableCell>Start Date</TableCell>
                                    <TableCell>End Date</TableCell>
                                    <TableCell align="right">Pass.</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedBookings.map((booking) => (
                                    <TableRow
                                        key={booking.bookingID}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {booking.bookingID}
                                        </TableCell>
                                        <TableCell>
                                            {booking.user ? booking.user.email : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {booking.vehicle ? booking.vehicle.plateNumber : 'N/A'}
                                        </TableCell>
                                        <TableCell>{booking.pickUp || 'N/A'}</TableCell>
                                        <TableCell>{booking.dropOff || 'N/A'}</TableCell>
                                        <TableCell>
                                            {booking.requestDate ? new Date(booking.requestDate).toLocaleString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {booking.startDate ? new Date(booking.startDate).toLocaleString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {booking.endDate ? new Date(booking.endDate).toLocaleString() : 'N/A'}
                                        </TableCell>
                                        <TableCell align="right">{booking.numberOfPassengers}</TableCell>
                                        <TableCell>
                                            <FormControl size="small" sx={{ minWidth: 120 }} disabled={mutationLoading}> {/* Disable dropdown during mutation */}
                                                <Select
                                                    value={booking.status}
                                                    onChange={(event) => handleStatusChange(booking.bookingID, event.target.value)}
                                                    displayEmpty
                                                    inputProps={{ 'aria-label': `status for booking ${booking.bookingID}` }}
                                                >
                                                    {/* Ensure these values match your backend enum names (case-sensitive) */}
                                                    <MenuItem value="Pending">Pending</MenuItem>
                                                    <MenuItem value="Accepted">Accepted</MenuItem>
                                                    <MenuItem value="Going">In Progress</MenuItem>
                                                    <MenuItem value="Done">Done</MenuItem>
                                                    <MenuItem value="Canceled">Canceled</MenuItem>
                                                    <MenuItem value="Rejected">Rejected</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {/* Optional Edit Button */}
                                                {/* <IconButton size="small" onClick={() => console.log('Edit', booking.bookingId)} aria-label={`edit booking ${booking.bookingId}`} disabled={mutationLoading}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton> */}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDeleteConfirm(booking)} // Open confirmation dialog
                                                    aria-label={`delete booking ${booking.bookingID}`}
                                                    color="error"
                                                    disabled={mutationLoading} // Disable during mutation
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {/* Table Pagination */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredBookings.length} // Total number of filtered rows
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteConfirm}
                onClose={handleCloseDeleteConfirm}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">{"Confirm Booking Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete booking {bookingToDelete?.bookingId}? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirm} color="secondary" disabled={mutationLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteBooking} color="error" variant="contained" disabled={mutationLoading}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for update/delete messages */}
            <Snackbar open={statusUpdateMessage.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <AlertSnackbar onClose={handleCloseSnackbar} severity={statusUpdateMessage.severity}>
                    {statusUpdateMessage.text}
                </AlertSnackbar>
            </Snackbar>

        </Box>
    );
}
