import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    AlertTitle,
    DialogContentText,
    styled,
    TablePagination,
    InputAdornment,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const getAuthToken = () => {
    return localStorage.getItem('token'); // Replace with your actual token retrieval
};

const API_BASE_URL = 'https://it342-eduwheels.onrender.com';
const BOOKINGS_API = `${API_BASE_URL}/api/bookings`;
const USERS_API = `${API_BASE_URL}/users`; // Assuming you have a users endpoint
const VEHICLES_API = `${API_BASE_URL}/api/vehicles`; // Assuming you have a vehicles endpoint

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(2),
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
}));

// Delete Confirmation Dialog
const DeleteBookingDialog = ({ open, onClose, onConfirm, bookingId }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to delete booking ID "{bookingId}"? This action cannot be undone.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="secondary">Cancel</Button>
            <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
    </Dialog>
);

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('create');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingFormData, setBookingFormData] = useState({
        startDate: '',
        endDate: '',
        numberOfPassengers: '',
        status: 'Pending',
        userid: '',
        vehicleId: '',
        pickUp: '',
        dropOff: '',
    });
    const [loading, setLoading] = useState(true);
    const [mutationLoading, setMutationLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dialogError, setDialogError] = useState('');
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    // Fetch Users and Vehicles for dropdowns
    const fetchUsersAndVehicles = useCallback(async () => {
        try {
            const token = getAuthToken();
            const usersResponse = await fetch(USERS_API, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData || []);
            } else {
                console.error("Failed to fetch users:", usersResponse.status);
            }

            const vehiclesResponse = await fetch(VEHICLES_API, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (vehiclesResponse.ok) {
                const vehiclesData = await vehiclesResponse.json();
                setVehicles(vehiclesData || []);
            } else {
                console.error("Failed to fetch vehicles:", vehiclesResponse.status);
            }
        } catch (error) {
            console.error("Error fetching users and vehicles:", error);
        }
    }, []);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            const response = await fetch(BOOKINGS_API, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setBookings(data || []);
        } catch (e) {
            setError(e.message || "Failed to fetch bookings.");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
        fetchUsersAndVehicles();
    }, [fetchBookings, fetchUsersAndVehicles]);

    const handleOpenCreateDialog = () => {
        setSelectedBooking(null);
        setBookingFormData({
            startDate: '',
            endDate: '',
            numberOfPassengers: '',
            status: 'Pending',
            userId: '',
            vehicleId: '',
            pickUp: '',
            dropOff: '',
        });
        setDialogType('create');
        setDialogError('');
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (booking) => {
        setSelectedBooking(booking);
        setBookingFormData({
            startDate: format(new Date(booking.startDate), 'yyyy-MM-dd\'T\'HH:mm'),
            endDate: format(new Date(booking.endDate), 'yyyy-MM-dd\'T\'HH:mm'),
            numberOfPassengers: booking.numberOfPassengers || '',
            status: booking.status || 'Pending',
            userId: booking.user?.userid || '',
            vehicleId: booking.vehicle?.vehicleId || '',
            pickUp: booking.pickUp || '',
            dropOff: booking.dropOff || '',
        });
        setDialogType('edit');
        setDialogError('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        if (mutationLoading) return;
        setOpenDialog(false);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setBookingFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSaveBooking = async () => {
        setMutationLoading(true);
        setDialogError('');
        const token = getAuthToken();
        if (!token) {
            setDialogError("Authentication token not found. Please log in.");
            setMutationLoading(false);
            return;
        }

        const payload = {
            startDate: bookingFormData.startDate,
            endDate: bookingFormData.endDate,
            numberOfPassengers: parseInt(bookingFormData.numberOfPassengers),
            status: bookingFormData.status,
            userId: parseInt(bookingFormData.userId),
            vehicleId: parseInt(bookingFormData.vehicleId),
            pickUp: bookingFormData.pickUp,
            dropOff: bookingFormData.dropOff,
        };

        const isCreating = dialogType === 'create';
        const url = isCreating ? BOOKINGS_API : `${BOOKINGS_API}/${selectedBooking.bookingID}`;
        const method = isCreating ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorMsg = `Failed to ${isCreating ? 'create' : 'update'} booking. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }

            const resultData = await response.json();
            fetchBookings(); // Refetch data after successful operation
            handleCloseDialog();
        } catch (e) {
            setDialogError(e.message || `An error occurred while ${isCreating ? 'creating' : 'updating'} the booking.`);
        } finally {
            setMutationLoading(false);
        }
    };

    const handleOpenDeleteConfirm = (booking) => {
        setSelectedBooking(booking);
        setOpenDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setOpenDeleteConfirm(false);
        setSelectedBooking(null);
    };

    const handleDeleteBooking = async () => {
        if (!selectedBooking) return;
        const idToDelete = selectedBooking.bookingID;

        setMutationLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token not found.");
            setMutationLoading(false);
            handleCloseDeleteConfirm();
            return;
        }

        try {
            const response = await fetch(`${BOOKINGS_API}/${idToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok && response.status !== 204) {
                let errorMsg = `Failed to delete booking. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* Ignore if error response is not JSON */ }
                throw new Error(errorMsg);
            }

            fetchBookings(); // Refetch data after successful deletion
            handleCloseDeleteConfirm();
        } catch (e) {
            setError(e.message || "An error occurred while deleting the booking.");
            handleCloseDeleteConfirm();
        } finally {
            setMutationLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredBookings = bookings.filter((booking) =>
        (booking.bookingID?.toString() || '').includes(searchTerm.toLowerCase()) ||
        (booking.user?.userid?.toString() || '').includes(searchTerm.toLowerCase()) ||
        (booking.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.vehicle?.vehicleId?.toString() || '').includes(searchTerm.toLowerCase()) ||
        (booking.vehicle?.plateNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.pickUp?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.dropOff?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (booking.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const displayedBookings = filteredBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ padding: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h4" gutterBottom>
                Manage Bookings
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorOutlineIcon />}>
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                    disabled={mutationLoading}
                >
                    Add New Booking
                </Button>
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
                    sx={{ width: { xs: '100%', sm: '300px' } }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <StyledTableContainer component={Paper}>
                    <Table aria-label="bookings table">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                <TableCell>ID</TableCell>
                                <TableCell>User ID</TableCell>
                                <TableCell>Vehicle ID</TableCell>
                                <TableCell>Pick Up</TableCell>
                                <TableCell>Drop Off</TableCell>
                                <TableCell>Passengers</TableCell>
                                <TableCell>Request Date</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                                        {searchTerm ? 'No bookings match your search.' : 'No bookings found.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayedBookings.map((booking) => (
                                    <TableRow key={booking.bookingID} hover>
                                        <TableCell>{booking.bookingID}</TableCell>
                                        <TableCell>{booking.user?.userid || 'N/A'}</TableCell>
                                        <TableCell>{booking.vehicle?.vehicleId || 'N/A'}</TableCell>
                                        <TableCell>{booking.pickUp || 'N/A'}</TableCell>
                                        <TableCell>{booking.dropOff || 'N/A'}</TableCell>
                                        <TableCell>{booking.numberOfPassengers || 'N/A'}</TableCell>
                                        <TableCell>{booking.requestDate ? format(new Date(booking.requestDate), 'yyyy-MM-dd HH:mm') : 'N/A'}</TableCell>
                                        <TableCell>{booking.startDate ? format(new Date(booking.startDate), 'yyyy-MM-dd HH:mm') : 'N/A'}</TableCell>
                                        <TableCell>{booking.endDate ? format(new Date(booking.endDate), 'yyyy-MM-dd HH:mm') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Box
                                                component="span"
                                                sx={{
                                                    bgcolor: booking.status === 'Pending' ? 'info.light' :
                                                        booking.status === 'Approved' ? 'success.light' :
                                                            booking.status === 'Rejected' ? 'error.light' :
                                                                booking.status === 'Going' ? 'warning.light' :
                                                                    booking.status === 'Done' ? 'grey.300' :
                                                                        booking.status === 'Accepted' ? 'primary.light' :
                                                                            booking.status === 'Canceled' ? 'grey.500' : 'default',
                                                    color: booking.status === 'Pending' ? 'info.dark' :
                                                        booking.status === 'Approved' ? 'success.dark' :
                                                            booking.status === 'Rejected' ? 'error.dark' :
                                                                booking.status === 'Going' ? 'warning.dark' :
                                                                    booking.status === 'Done' ? 'grey.700' :
                                                                        booking.status === 'Accepted' ? 'primary.dark' :
                                                                            booking.status === 'Canceled' ? 'grey.900' : 'default',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'medium',
                                                }}
                                            >
                                                {booking.status || 'N/A'}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenEditDialog(booking)}
                                                disabled={mutationLoading}
                                                title="Edit Booking"
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDeleteConfirm(booking)}
                                                disabled={mutationLoading}
                                                title="Delete Booking"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredBookings.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </StyledTableContainer>
            )}

            {/* Create/Edit Booking Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="form-dialog-title"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="form-dialog-title">
                    {dialogType === 'create' ? 'Create New Booking' : `Edit Booking ID: ${selectedBooking?.bookingID || ''}`}
                </DialogTitle>
                <DialogContent>
                    {dialogError && (
                        <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>
                    )}
                    <TextField
                        margin="dense"
                        id="startDate"
                        name="startDate"
                        label="Start Date"
                        type="datetime-local"
                        fullWidth
                        value={bookingFormData.startDate}
                        onChange={handleInputChange}
                        required
                        disabled={mutationLoading}
                    />
                    <TextField
                        margin="dense"
                        id="endDate"
                        name="endDate"
                        label="End Date"
                        type="datetime-local"
                        fullWidth
                        value={bookingFormData.endDate}
                        onChange={handleInputChange}
                        required
                        disabled={mutationLoading}
                    />
                    <TextField
                        margin="dense"
                        id="numberOfPassengers"
                        name="numberOfPassengers"
                        label="Number of Passengers"
                        type="number"
                        fullWidth
                        value={bookingFormData.numberOfPassengers}
                        onChange={handleInputChange}
                        required
                        disabled={mutationLoading}
                        inputProps={{ min: 1 }}
                    />
                    <FormControl fullWidth margin="dense" required disabled={mutationLoading}>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status"
                            name="status"
                            value={bookingFormData.status}
                            onChange={handleInputChange}
                            label="Status"
                        >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                            <MenuItem value="Going">Going</MenuItem>
                            <MenuItem value="Done">Done</MenuItem>
                            <MenuItem value="Accepted">Accepted</MenuItem>
                            <MenuItem value="Canceled">Canceled</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" required disabled={mutationLoading}>
                        <InputLabel id="user-label">User ID</InputLabel>
                        <Select
                            labelId="user-label"
                            id="userId"
                            name="userId"
                            value={bookingFormData.userId}
                            onChange={handleInputChange}
                            label="User ID"
                        >
                            {users.map((user) => (
                                <MenuItem key={user.userid} value={user.userid}>
                                    {user.userid} - {user.email}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" required disabled={mutationLoading}>
                        <InputLabel id="vehicle-label">Vehicle ID</InputLabel>
                        <Select
                            labelId="vehicle-label"
                            id="vehicleId"
                            name="vehicleId"
                            value={bookingFormData.vehicleId}
                            onChange={handleInputChange}
                            label="Vehicle ID"
                        >
                            {vehicles.map((vehicle) => (
                                <MenuItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                    {vehicle.vehicleId} - {vehicle.plateNumber} ({vehicle.vehicleName})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="pickUp"
                        name="pickUp"
                        label="Pick Up Location"
                        type="text"
                        fullWidth
                        value={bookingFormData.pickUp}
                        onChange={handleInputChange}
                        disabled={mutationLoading}
                    />
                    <TextField
                        margin="dense"
                        id="dropOff"
                        name="dropOff"
                        label="Drop Off Location"
                        type="text"
                        fullWidth
                        value={bookingFormData.dropOff}
                        onChange={handleInputChange}
                        disabled={mutationLoading}
                    />
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={handleCloseDialog} color="secondary" disabled={mutationLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveBooking}
                        color="primary"
                        variant="contained"
                        disabled={mutationLoading}
                        startIcon={mutationLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {mutationLoading ? 'Saving...' : (dialogType === 'create' ? 'Create' : 'Update')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <DeleteBookingDialog
                open={openDeleteConfirm}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleDeleteBooking}
                bookingId={selectedBooking?.bookingID}
            />
        </Box>
    );
}