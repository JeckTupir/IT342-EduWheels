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
    TablePagination,
    DialogContentText,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Alert, AlertTitle } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Separate CSS (AdminUsersPage.module.css)
// import './AdminUsersPage.module.css'; // Removed - all styles are in the immersive

const getAuthToken = () => {
    return localStorage.getItem('token'); // Example: retrieve from local storage
};

const API_BASE_URL = 'http://localhost:8080/users'; // Updated base URL to /users

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
}));

const StyledTableContainer = styled(TableContainer)({
    borderRadius: '8px',
    overflow: 'hidden',
});

const StyledTableHead = styled(TableHead)({
    backgroundColor: '#f5f5f5',
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const StyledTableCell = styled(TableCell)({
    padding: '12px',
});

const StyledIconButton = styled(IconButton)({
    margin: '4px',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
});

const StyledButton = styled(Button)({
    margin: '8px',
    borderRadius: '8px',
    textTransform: 'none',
});

const StyledDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
    },
});

const StyledTextField = styled(TextField)({
    margin: '8px 0 ',
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
    },
});

const StyledFormControl = styled(FormControl)({
    margin: '8px 0',
    '& .MuiInputBase-root': {
        borderRadius: '8px',
    },
});

const StyledAvatar = styled(Avatar)({
    width: 40,
    height: 40,
    borderRadius: '50%',
    marginRight: 12,
});

const MotionTableRow = motion(StyledTableRow);

const UserRow = ({ user, onEdit, onDelete }) => ( // Use userid
    <MotionTableRow
        key={user.userid} // Use userid
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
    >
        <StyledTableCell component="th" scope="row">
            {user.schoolid || 'N/A'} {/* Display schoolid */}
        </StyledTableCell>
        <StyledTableCell>
            <Box display="flex" alignItems="center">
                {/* Use a placeholder if profilePicture is missing */}
                <StyledAvatar alt={user.firstName}>
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </StyledAvatar>
                <div>
                    <Typography variant="subtitle2">{user.firstName} {user.lastName}</Typography>
                    <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                </div>
            </Box>
        </StyledTableCell>
        <StyledTableCell>{user.username}</StyledTableCell>
        <StyledTableCell>{user.role}</StyledTableCell>
        <StyledTableCell>
            <StyledIconButton aria-label="edit" onClick={() => onEdit(user)} color="primary">
                <EditIcon />
            </StyledIconButton>
            <StyledIconButton aria-label="delete" onClick={() => onDelete(user.userid)} color="error"> {/* Use userid */}
                <DeleteIcon />
            </StyledIconButton>
        </StyledTableCell>
    </MotionTableRow>
);


const CreateEditUserDialog = ({ open, onClose, user, onSave, dialogType }) => {
    const [currentUserData, setCurrentUserData] = useState({}); // Renamed state variable
    const [error, setError] = useState('');

    useEffect(() => {
        // Initialize state based on user prop and dialog type
        if (user) {
            // Ensure all expected fields are present, defaulting if necessary
            setCurrentUserData({
                userid: user.userid ?? null, // Keep userid if present (for edits)
                username: user.username || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                schoolid: user.schoolid || '', // Add schoolid
                role: user.role || 'User',     // Default role
                password: '', // Always clear password field on open
                // profilePicture: user.profilePicture || '', // Profile picture handling removed for simplicity, add back if needed
            });
        }
        setError(''); // Clear error when dialog opens or user changes
    }, [user, open]); // Rerun effect if user or open state changes

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentUserData({ ...currentUserData, [name]: value });
    };

    const handleSave = () => {
        // Add validation for schoolid
        if (!currentUserData.username || !currentUserData.firstName || !currentUserData.lastName || !currentUserData.email || !currentUserData.role || !currentUserData.schoolid) {
            setError('Please fill in all required fields (Username, Names, Email, School ID, Role).');
            return;
        }
        if (dialogType === 'create' && !currentUserData.password) {
            setError('Please provide a password for the new user.');
            return;
        }
        // Basic email validation
        if (!/\S+@\S+\.\S+/.test(currentUserData.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        // Basic school ID validation (adjust regex/logic if needed)
        if (!/^\d{9}$/.test(currentUserData.schoolid.replace(/-/g, ''))) {
            setError('School ID must be 9 digits.');
            return;
        }

        setError(''); // Clear any previous error

        // Prepare data for saving (remove password if it's an edit and wasn't changed)
        const dataToSave = { ...currentUserData };
        if (dialogType === 'edit') {
            // Decide if you want to allow password changes here.
            // If not, remove password field entirely for edit mode.
            // If yes, only include password if the field is not empty.
            delete dataToSave.password; // Don't send password on normal edit
        }
        // Remove userid for create operations as it's generated by backend
        if (dialogType === 'create') {
            delete dataToSave.userid;
        }


        onSave(dataToSave); // Pass the validated and prepared data
    };


    // Render null if not open to ensure state reset via useEffect
    if (!open) {
        return null;
    }

    return (
        <StyledDialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
                {dialogType === 'create' ? 'Create New User' : 'Edit User'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" style={{ marginBottom: '16px' }}> {/* Use style for margin */}
                        <AlertTitle>Error</AlertTitle>
                        {error}
                    </Alert>
                )}
                <StyledTextField
                    autoFocus
                    margin="dense"
                    id="username"
                    name="username"
                    label="Username"
                    type="text"
                    fullWidth
                    value={currentUserData.username || ''}
                    onChange={handleInputChange}
                    required
                />
                <StyledTextField
                    margin="dense"
                    id="firstName"
                    name="firstName"
                    label="First Name"
                    type="text"
                    fullWidth
                    value={currentUserData.firstName || ''}
                    onChange={handleInputChange}
                    required
                />
                <StyledTextField
                    margin="dense"
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    type="text"
                    fullWidth
                    value={currentUserData.lastName || ''}
                    onChange={handleInputChange}
                    required
                />
                <StyledTextField
                    margin="dense"
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    value={currentUserData.email || ''}
                    onChange={handleInputChange}
                    required
                    // Disable email editing for existing users if needed
                    // disabled={dialogType === 'edit'}
                />
                {/* Add School ID Field */}
                <StyledTextField
                    margin="dense"
                    id="schoolid"
                    name="schoolid"
                    label="School ID (9 digits)"
                    type="text" // Keep as text to allow hyphens, backend will strip
                    fullWidth
                    value={currentUserData.schoolid || ''}
                    onChange={handleInputChange}
                    required
                />
                {/* Only show password field when creating a new user */}
                {dialogType === 'create' && (
                    <StyledTextField
                        margin="dense"
                        id="password"
                        name="password"
                        label="Password"
                        type="password"
                        fullWidth
                        value={currentUserData.password || ''}
                        onChange={handleInputChange}
                        required
                    />
                )}
                <StyledFormControl fullWidth margin="dense" required>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                        labelId="role-label"
                        id="role"
                        name="role"
                        value={currentUserData.role || ''}
                        onChange={handleInputChange}
                        label="Role"
                    >
                        <MenuItem value="Admin">Admin</MenuItem>
                        {/* Add other roles as needed */}
                        <MenuItem value="User">User</MenuItem>
                        {/* <MenuItem value="Staff">Staff</MenuItem> */}
                    </Select>
                </StyledFormControl>
                {/* Profile Picture field removed for simplicity, add back if needed
                <StyledTextField
                    margin="dense"
                    id="profilePicture"
                    name="profilePicture"
                    label="Profile Picture URL"
                    type="text"
                    fullWidth
                    value={currentUserData.profilePicture || ''}
                    onChange={handleInputChange}
                /> */}
            </DialogContent>
            <DialogActions>
                <StyledButton onClick={onClose} color="secondary"> {/* Changed color */}
                    Cancel
                </StyledButton>
                <StyledButton onClick={handleSave} variant="contained" color="primary"> {/* Added variant */}
                    {dialogType === 'create' ? 'Create' : 'Update'}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};


const DeleteUserDialog = ({ open, onClose, userId, onDelete }) => { // Use userId for clarity, but it's the id value
    if (!open) return null; // Don't render if not open

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this user? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <StyledButton onClick={onClose} color="secondary">
                    Cancel
                </StyledButton>
                {/* Pass the actual userId to delete */}
                <StyledButton onClick={() => onDelete(userId)} color="error" variant="contained">
                    Delete
                </StyledButton>
            </DialogActions>
        </Dialog>
    );
};


const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null); // Initialize as null
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [userToDeleteId, setUserToDeleteId] = useState(null); // Store only the ID
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // For fetch errors
    const [dialogError, setDialogError] = useState(''); // Separate error for dialog actions
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Fetch Users ---
    const fetchUsers = useCallback(async () => { // Use useCallback
        setLoading(true);
        setError(null); // Clear previous fetch errors
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token not found. Please log in.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_BASE_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Add Authorization header
                },
            });
            if (!response.ok) {
                // Try parsing error message from backend if available
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }
            const data = await response.json();
            // Ensure userid is used consistently
            const usersWithCorrectId = data.map(user => ({ ...user, id: user.userid })); // Map backend 'userid' to frontend 'id' if needed, or just use userid everywhere
            setUsers(data); // Assuming backend returns 'userid'
        } catch (e) {
            setError(e.message || "Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means fetchUsers is created once


    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); // fetchUsers is now stable due to useCallback

    const handleOpenCreateDialog = () => {
        setSelectedUser({}); // Use an empty object for create
        setDialogType('create');
        setDialogError(''); // Clear previous dialog errors
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (user) => {
        setSelectedUser(user); // Pass the full user object
        setDialogType('edit');
        setDialogError(''); // Clear previous dialog errors
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null); // Clear selected user on close
    };

    // --- Save User (Create or Update) ---
    const handleSaveUser = async (userData) => {
        setDialogError(''); // Clear previous errors
        const token = getAuthToken();
        if (!token) {
            setDialogError("Authentication token not found.");
            return; // Don't proceed without token
        }

        const isCreating = dialogType === 'create';
        const url = isCreating ? API_BASE_URL : `${API_BASE_URL}/${userData.userid}`; // Use userid for update URL
        const method = isCreating ? 'POST' : 'PUT';

        // Prepare the body, ensure userid is not sent on create
        const body = { ...userData };
        if (isCreating) {
            delete body.userid; // Remove null/undefined userid before sending
        }
        // Optionally remove password if empty during edit, or handle password changes specifically
        if (!isCreating && (!body.password || body.password.trim() === '')) {
            delete body.password;
        }


        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Add Authorization header
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                let errorMsg = `Failed to ${isCreating ? 'create' : 'update'} user. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg; // Use backend message if available
                } catch (e) { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }

            const resultData = await response.json(); // Backend now returns the created/updated user

            // Update state immediately for better UX
            if (isCreating) {
                setUsers(prevUsers => [...prevUsers, resultData]);
            } else {
                setUsers(prevUsers =>
                    prevUsers.map(u => (u.userid === resultData.userid ? resultData : u)) // Use userid
                );
            }

            handleCloseDialog();
            // fetchUsers(); // Optional: Re-fetch if you want to ensure sync, but optimistic update is faster
        } catch (e) {
            setDialogError(e.message || `An error occurred while ${isCreating ? 'creating' : 'updating'} the user.`);
        }
    };


    // --- Delete User ---
    const handleOpenDeleteDialog = (id) => { // Receive userid
        setUserToDeleteId(id); // Store the id
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setUserToDeleteId(null); // Clear the id
    };

    const handleDeleteUser = async (id) => { // Receive userid
        setError(null); // Clear main page error
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token not found.");
            handleCloseDeleteDialog(); // Close the confirmation dialog
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, { // Use the correct id
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // Add Authorization header
                },
            });

            // Check for 204 No Content or other success statuses (like 200 OK or 202 Accepted)
            if (!response.ok && response.status !== 204) { // Check if response is NOT ok AND NOT 204
                let errorMsg = `Failed to delete user. Status: ${response.status}`;
                try {
                    // Attempt to get error message if backend sends one on failure (e.g., 404)
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* Ignore if error response is not JSON */ }
                throw new Error(errorMsg);
            }

            // If deletion was successful (200, 202, 204), update state
            setUsers(prevUsers => prevUsers.filter((user) => user.userid !== id)); // Use userid
            handleCloseDeleteDialog(); // Close confirmation dialog
            // fetchUsers(); // Optional: Re-fetch instead of local filter if preferred
        } catch (e) {
            setError(e.message || "An error occurred while deleting the user."); // Show error on the main page
            handleCloseDeleteDialog(); // Still close the dialog on error
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

    // Ensure filtering works even if some fields are null/undefined
    const filteredUsers = users.filter((user) =>
        (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.schoolid?.toLowerCase() || '').includes(searchTerm.toLowerCase()) // Add schoolid filter
    );

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredUsers.length - page * rowsPerPage);
    const displayedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ padding: 3 }}> {/* Use sx prop for padding */}
            <Typography variant="h4" gutterBottom> {/* Add gutterBottom */}
                Manage Users
            </Typography>
            {/* Display general fetch error */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            )}
            {/* Display dialog action error */}
            {dialogError && (
                <Alert severity="warning" sx={{ mb: 2 }}> {/* Changed severity */}
                    <AlertTitle>Action Failed</AlertTitle>
                    {dialogError}
                </Alert>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <StyledButton
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                >
                    Add New User
                </StyledButton>
                <TextField // Simplified search input
                    variant="outlined"
                    size="small"
                    placeholder="Search Users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon position="start" />,
                    }}
                    sx={{ width: '300px' }}
                />
            </Box>

            <StyledPaper>
                <StyledTableContainer>
                    <Table aria-label="users table">
                        <StyledTableHead>
                            <TableRow>
                                <StyledTableCell>School ID</StyledTableCell>
                                <StyledTableCell>Name</StyledTableCell>
                                <StyledTableCell>Username</StyledTableCell>
                                <StyledTableCell>Role</StyledTableCell>
                                <StyledTableCell>Actions</StyledTableCell>
                            </TableRow>
                        </StyledTableHead>
                        <TableBody>
                            <AnimatePresence>
                                {loading ? (
                                    <TableRow>
                                        <StyledTableCell colSpan={5} align="center">
                                            Loading users...
                                        </StyledTableCell>
                                    </TableRow>
                                ) : displayedUsers.length === 0 ? (
                                    <TableRow>
                                        <StyledTableCell colSpan={5} align="center">
                                            {searchTerm ? 'No users match your search.' : 'No users found.'}
                                        </StyledTableCell>
                                    </TableRow>
                                ) : (
                                    displayedUsers.map((user) => (
                                        <UserRow
                                            key={user.userid} // Use userid
                                            user={user}
                                            onEdit={handleOpenEditDialog}
                                            onDelete={handleOpenDeleteDialog} // Pass the handler itself
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                            {/* Render empty rows if needed, or remove if pagination handles it */}
                            {/* {emptyRows > 0 && !loading && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={5} />
                                </TableRow>
                            )} */}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </StyledPaper>

            {/* Dialogs */}
            <CreateEditUserDialog
                open={openDialog}
                onClose={handleCloseDialog}
                user={selectedUser} // Pass the selected user object
                onSave={handleSaveUser}
                dialogType={dialogType}
                // Pass dialogError state if you want error inside dialog
                // error={dialogError}
                // clearError={() => setDialogError('')}
            />

            <DeleteUserDialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                userId={userToDeleteId} // Pass the ID to delete
                onDelete={handleDeleteUser} // Pass the actual delete function
            />
        </Box>
    );
};

export default AdminUsersPage;

