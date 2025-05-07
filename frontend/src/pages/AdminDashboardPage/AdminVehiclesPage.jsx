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
    Avatar,
    CircularProgress, // Import CircularProgress for loading indication
    Alert,           // Import Alert for displaying errors
    AlertTitle,      // Import AlertTitle
    DialogContentText, // Import for delete confirmation
    styled,          // Import styled for custom components
    TablePagination, // Import TablePagination
    InputAdornment,  // For search icon
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    CloudUpload as CloudUploadIcon, // Icon for upload button
    Search as SearchIcon,           // Icon for search input
    ErrorOutline as ErrorOutlineIcon, // Icon for errors
    Image as ImageIcon,              // Placeholder icon
} from '@mui/icons-material';
// Removed import './AdminVehiclesPage.css'; Use sx props or styled components

// --- IMPORTANT ---
// Assume you have a way to get the JWT token after login.
// Replace this with your actual token retrieval logic (e.g., from localStorage, context)
const getAuthToken = () => {
    return localStorage.getItem('token'); // Example: retrieve from local storage
};

const API_BASE_URL = 'https://it342-eduwheels.onrender.com'; // Keep base URL separate
const VEHICLES_API = `${API_BASE_URL}/api/vehicles`; // Endpoint for vehicles

// Styled Components (Optional but recommended for consistency)
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(2),
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
}));

const StyledInput = styled('input')({
    display: 'none',
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 56,
    height: 56,
    marginRight: theme.spacing(1),
    backgroundColor: theme.palette.grey[300], // Placeholder background
    fontSize: '0.8rem',
    '& .MuiAvatar-img': {
        objectFit: 'cover', // Ensure image covers the avatar area
    },
}));

// --- Helper Functions ---
const getImageUrl = (path) => {
    if (!path) return null;
    // Ensure path doesn't start with /uploads/ or just /
    const filename = path.replace(/^\/?uploads\//, '');
    // Basic check to prevent constructing invalid URLs if path is weird
    if (!filename || filename.includes('/')) return null;
    return `${VEHICLES_API}/uploads/${filename}`;
};

// --- Components ---

// Delete Confirmation Dialog
const DeleteVehicleDialog = ({ open, onClose, onConfirm, vehicleName }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to delete the vehicle "{vehicleName || 'this vehicle'}"? This action cannot be undone.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="secondary">Cancel</Button>
            <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
    </Dialog>
);


// Main Page Component
export default function AdminVehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('create');
    const [selectedVehicle, setSelectedVehicle] = useState(null); // Store the whole vehicle object for editing/deleting
    const [vehicleFormData, setVehicleFormData] = useState({
        plateNumber: '',
        type: 'Bus',
        capacity: '',
        availableSeats: 0, // Add availableSeats here
        status: 'Available',
        vehicleName: '',
        photo: null,
        photoPreview: null,
    });
    const [loading, setLoading] = useState(true); // For initial fetch
    const [mutationLoading, setMutationLoading] = useState(false); // For CUD operations
    const [error, setError] = useState(null); // For general/fetch errors
    const [dialogError, setDialogError] = useState(''); // For dialog errors
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);


    // --- Data Fetching ---
    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        // No token needed for public GET usually, but include if you secured GET /api/vehicles
        // if (!token && /* check if GET is secured */ ) {
        //     setError("Authentication required to view vehicles.");
        //     setLoading(false);
        //     return;
        // }

        try {
            const response = await fetch(VEHICLES_API, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setVehicles(data || []); // Ensure it's always an array
        } catch (e) {
            setError(e.message || "Failed to fetch vehicles.");
            setVehicles([]); // Clear vehicles on error
        } finally {
            setLoading(false);
        }
    }, []); // Add dependencies if needed, e.g. token state

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // --- Dialog Management ---
    const handleOpenCreateDialog = () => {
        setSelectedVehicle(null);
        setVehicleFormData({
            plateNumber: '',
            type: 'Bus',
            capacity: '',
            availableSeats: 0,
            status: 'Available',
            vehicleName: '',
            photo: null,
            photoPreview: null,
        });
        setDialogType('create');
        setDialogError('');
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (vehicle) => {
        setSelectedVehicle(vehicle);
        setVehicleFormData({
            plateNumber: vehicle.plateNumber || '',
            type: vehicle.type || 'Bus',
            capacity: vehicle.capacity || '',
            availableSeats: vehicle.availableSeats || 0, // Populate availableSeats
            status: vehicle.status || 'Available',
            vehicleName: vehicle.vehicleName || '',
            photo: null, // Clear photo input, preview existing one
            photoPreview: getImageUrl(vehicle.photoPath), // Show current photo
        });
        setDialogType('edit');
        setDialogError('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        if (mutationLoading) return; // Prevent closing while saving
        setOpenDialog(false);
    };

    // --- Form Input Handling ---
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setVehicleFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setVehicleFormData((prevData) => ({
                ...prevData,
                photo: file,
                photoPreview: URL.createObjectURL(file) // Create preview URL
            }));
        } else {
            // If user cancels file selection, maybe revert to original preview?
            setVehicleFormData((prevData) => ({
                ...prevData,
                photo: null,
                photoPreview: selectedVehicle ? getImageUrl(selectedVehicle.photoPath) : null
            }));
        }
    };

    // --- CUD Operations ---
    const handleSaveVehicle = async () => {
        setMutationLoading(true);
        setDialogError('');
        const token = getAuthToken();
        if (!token) {
            setDialogError("Authentication token not found. Please log in.");
            setMutationLoading(false);
            return;
        }

        // Basic Validation
        if (!vehicleFormData.plateNumber || !vehicleFormData.vehicleName || !vehicleFormData.capacity) {
            setDialogError("Please fill in Plate Number, Vehicle Name, and Capacity.");
            setMutationLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('plateNumber', vehicleFormData.plateNumber);
        formData.append('type', vehicleFormData.type);
        formData.append('capacity', vehicleFormData.capacity);
        formData.append('availableSeats', vehicleFormData.availableSeats);
        formData.append('status', vehicleFormData.status);
        formData.append('vehicleName', vehicleFormData.vehicleName); // FIX: Append vehicleName
        if (vehicleFormData.photo) { // Only append if a new photo was selected
            formData.append('photo', vehicleFormData.photo);
        }

        const isCreating = dialogType === 'create';
        const url = isCreating
            ? `${VEHICLES_API}/withPhoto`
            : `${VEHICLES_API}/updateWithPhoto/${selectedVehicle.vehicleId}`; // Use vehicleId
        const method = isCreating ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`, // Add Authorization header
                    // 'Content-Type' is set automatically by browser for FormData
                },
                body: formData,
            });

            if (!response.ok) {
                let errorMsg = `Failed to ${isCreating ? 'create' : 'update'} vehicle. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }

            const resultData = await response.json();

            // Optimistic Update / Add to state
            if (isCreating) {
                setVehicles(prev => [...prev, resultData]);
            } else {
                setVehicles(prev =>
                    prev.map(v => (v.vehicleId === resultData.vehicleId ? resultData : v))
                );
            }

            handleCloseDialog();
            // fetchVehicles(); // Optional: uncomment to refetch data from server
        } catch (e) {
            setDialogError(e.message || `An error occurred while ${isCreating ? 'creating' : 'updating'} the vehicle.`);
        } finally {
            setMutationLoading(false);
        }
    };

    const handleOpenDeleteConfirm = (vehicle) => {
        setSelectedVehicle(vehicle); // Store vehicle to get name and ID
        setOpenDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setOpenDeleteConfirm(false);
        setSelectedVehicle(null);
    };

    const handleDeleteVehicle = async () => {
        if (!selectedVehicle) return;
        const idToDelete = selectedVehicle.vehicleId; // Get ID before closing dialog

        setMutationLoading(true); // Indicate loading state
        setError(null); // Clear main page error
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token not found.");
            setMutationLoading(false);
            handleCloseDeleteConfirm();
            return;
        }

        try {
            // Use VEHICLES_API constant
            const response = await fetch(`${VEHICLES_API}/${idToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok && response.status !== 204) { // Handle 204 No Content
                let errorMsg = `Failed to delete vehicle. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* Ignore if error response is not JSON */ }
                throw new Error(errorMsg);
            }

            // Update state locally
            setVehicles(prev => prev.filter(v => v.vehicleId !== idToDelete));
            handleCloseDeleteConfirm();
        } catch (e) {
            setError(e.message || "An error occurred while deleting the vehicle.");
            handleCloseDeleteConfirm(); // Close dialog even on error
        } finally {
            setMutationLoading(false);
        }
    };

    // --- Pagination and Filtering ---
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredVehicles = vehicles.filter((vehicle) =>
        (vehicle.vehicleName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (vehicle.plateNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (vehicle.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (vehicle.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const displayedVehicles = filteredVehicles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // --- Render ---
    return (
        <Box sx={{ padding: { xs: 1, sm: 2, md: 3 } }}> {/* Responsive padding */}
            <Typography variant="h4" gutterBottom>
                Manage Vehicles
            </Typography>

            {/* Display general errors */}
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
                    disabled={mutationLoading} // Disable while mutating
                >
                    Add New Vehicle
                </Button>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search Vehicles..."
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
                    <CircularProgress />
                </Box>
            ) : (
                <StyledTableContainer component={Paper}>
                    <Table aria-label="vehicles table">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                {/* <TableCell>ID</TableCell> */}
                                <TableCell>Photo</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Plate Number</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Capacity</TableCell>
                                <TableCell>Available Seats</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedVehicles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        {searchTerm ? 'No vehicles match your search.' : 'No vehicles found.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayedVehicles.map((vehicle) => (
                                    <TableRow key={vehicle.vehicleId} hover>
                                        {/* <TableCell>{vehicle.vehicleId}</TableCell> */}
                                        <TableCell>
                                            <StyledAvatar
                                                variant="rounded"
                                                src={getImageUrl(vehicle.photoPath)}
                                                alt={vehicle.vehicleName || 'Vehicle'}
                                            >
                                                {/* Fallback Icon or Initials */}
                                                {!getImageUrl(vehicle.photoPath) && <ImageIcon />}
                                            </StyledAvatar>
                                        </TableCell>
                                        <TableCell>{vehicle.vehicleName || 'N/A'}</TableCell>
                                        <TableCell>{vehicle.plateNumber || 'N/A'}</TableCell>
                                        <TableCell>{vehicle.type || 'N/A'}</TableCell>
                                        <TableCell>{vehicle.capacity || 'N/A'}</TableCell>
                                        <TableCell>{vehicle.availableSeats || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Box
                                                component="span"
                                                sx={{
                                                    bgcolor: vehicle.status === 'Available' ? 'success.light' : vehicle.status === 'Maintenance' ? 'warning.light' : 'error.light',
                                                    color: vehicle.status === 'Available' ? 'success.dark' : vehicle.status === 'Maintenance' ? 'warning.dark' : 'error.dark',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                {vehicle.status || 'N/A'}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenEditDialog(vehicle)}
                                                disabled={mutationLoading} // Disable while mutating
                                                title="Edit Vehicle"
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDeleteConfirm(vehicle)} // Pass vehicle object
                                                disabled={mutationLoading} // Disable while mutating
                                                title="Delete Vehicle"
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
                        count={filteredVehicles.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </StyledTableContainer>
            )}

            {/* Create/Edit Vehicle Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="form-dialog-title"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="form-dialog-title">
                    {dialogType === 'create' ? 'Create New Vehicle' : `Edit Vehicle: ${selectedVehicle?.vehicleName || ''}`}
                </DialogTitle>
                <DialogContent>
                    {/* Display Dialog Errors */}
                    {dialogError && (
                        <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>
                    )}
                    {/* Display Photo Preview */}
                    {vehicleFormData.photoPreview && (
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <img
                                src={vehicleFormData.photoPreview}
                                alt="Vehicle Preview"
                                style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px' }}
                            />
                        </Box>
                    )}
                    <TextField
                        autoFocus={dialogType === 'create'} // Only autofocus on create
                        margin="dense"
                        id="vehicleName"
                        name="vehicleName"
                        label="Vehicle Name"
                        type="text"
                        fullWidth
                        value={vehicleFormData.vehicleName}
                        onChange={handleInputChange}
                        required
                        disabled={mutationLoading}
                    />
                    <TextField
                        margin="dense"
                        id="plateNumber"
                        name="plateNumber"
                        label="Plate Number"
                        type="text"
                        fullWidth
                        value={vehicleFormData.plateNumber}
                        onChange={handleInputChange}
                        required
                        disabled={mutationLoading}
                    />
                    <FormControl fullWidth margin="dense" required disabled={mutationLoading}>
                        <InputLabel id="type-label">Type</InputLabel>
                        <Select
                            labelId="type-label"
                            id="type"
                            name="type"
                            value={vehicleFormData.type}
                            onChange={handleInputChange}
                            label="Type"
                        >
                            <MenuItem value="Bus">Bus</MenuItem>
                            <MenuItem value="Mini Bus">Mini Bus</MenuItem>
                            <MenuItem value="Van">Van</MenuItem>
                            {/* Add other types if needed */}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="capacity"
                        name="capacity"
                        label="Capacity"
                        type="number"
                        fullWidth
                        value={vehicleFormData.capacity}
                        onChange={handleInputChange}
                        required
                        disabled={mutationLoading}
                        InputProps={{ inputProps: { min: 1 } }} // Basic validation
                    />
                    <TextField
                        margin="dense"
                        id="availableSeats"
                        name="availableSeats"
                        label="Available Seats"
                        type="number"
                        fullWidth
                        value={vehicleFormData.availableSeats}
                        onChange={handleInputChange}
                        required
                        disabled={mutationLoading}
                        InputProps={{ inputProps: { min: 0 } }} // Basic validation
                    />
                    <FormControl fullWidth margin="dense" required disabled={mutationLoading}>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status"
                            name="status"
                            value={vehicleFormData.status}
                            onChange={handleInputChange}
                            label="Status"
                        >
                            <MenuItem value="Available">Available</MenuItem>
                            <MenuItem value="Rented">Rented</MenuItem>
                            <MenuItem value="Unavailable">Unavailable</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                        </Select>
                    </FormControl>
                    <Box sx={{ mt: 2 }}>
                        <label htmlFor="photo-upload">
                            <StyledInput
                                accept="image/*"
                                id="photo-upload"
                                type="file"
                                onChange={handlePhotoChange}
                                disabled={mutationLoading}
                            />
                            <Button
                                variant="outlined"
                                component="span"
                                color="primary"
                                startIcon={<CloudUploadIcon />}
                                disabled={mutationLoading}
                            >
                                {vehicleFormData.photo ? 'Change Photo' : 'Upload Photo'}
                            </Button>
                        </label>
                        {vehicleFormData.photo && (
                            <Typography variant="caption" sx={{ ml: 1 }}>
                                {vehicleFormData.photo.name}
                            </Typography>
                        )}
                        {dialogType === 'edit' && !vehicleFormData.photo && vehicleFormData.photoPreview && (
                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                Current photo will be kept if none is uploaded.
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={handleCloseDialog} color="secondary" disabled={mutationLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveVehicle}
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
            <DeleteVehicleDialog
                open={openDeleteConfirm}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleDeleteVehicle}
                vehicleName={selectedVehicle?.vehicleName}
            />
        </Box>
    );
}