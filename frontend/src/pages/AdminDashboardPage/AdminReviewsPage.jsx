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
    Rating,
    CircularProgress,
    Alert,
    AlertTitle,
    DialogContentText,
    styled,
    TablePagination,
    InputAdornment,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Search as SearchIcon,
    ErrorOutline as ErrorOutlineIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const getAuthToken = () => {
    return localStorage.getItem('token'); // Replace with your actual token retrieval
};

const API_BASE_URL = 'https://it342-eduwheels.onrender.com';
const REVIEWS_API = `${API_BASE_URL}/api/reviews`;
const USERS_API = `${API_BASE_URL}/users`; // Assuming you have a users endpoint
const BOOKINGS_API = `${API_BASE_URL}/api/bookings`; // Assuming you have a bookings endpoint

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(2),
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
}));

// Delete Confirmation Dialog
const DeleteReviewDialog = ({ open, onClose, onConfirm, reviewId }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to delete review ID "{reviewId}"? This action cannot be undone.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="secondary">Cancel</Button>
            <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
    </Dialog>
);

// Edit Review Dialog
const EditReviewDialog = ({ open, onClose, onSave, review }) => {
    const [editedRating, setEditedRating] = useState(review?.rating || 0);
    const [editedComment, setEditedComment] = useState(review?.comment || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (review) {
            setEditedRating(review.rating || 0);
            setEditedComment(review.comment || '');
        } else {
            setEditedRating(0);
            setEditedComment('');
        }
    }, [review]);

    const handleSave = async () => {
        setLoading(true);
        setError('');
        const token = getAuthToken();
        if (!token || !review?.reportID) {
            setError('Authentication token or Review ID missing.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${REVIEWS_API}/${review.reportID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ rating: editedRating, comment: editedComment }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData?.message || `Failed to update review. Status: ${response.status}`);
                setLoading(false);
                return;
            }

            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update review.');
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Review ID: {review?.reportID}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error">{error}</Alert>}
                <Rating
                    name="edit-rating"
                    value={editedRating}
                    onChange={(event, newValue) => setEditedRating(newValue)}
                    precision={1}
                    sx={{ mt: 2, mb: 2 }}
                />
                <TextField
                    label="Comment"
                    multiline
                    rows={4}
                    fullWidth
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mutationLoading, setMutationLoading] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [selectedReviewToDelete, setSelectedReviewToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedReviewToEdit, setSelectedReviewToEdit] = useState(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            const response = await fetch(REVIEWS_API, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setReviews(data || []);
        } catch (e) {
            setError(e.message || "Failed to fetch reviews.");
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleOpenDeleteConfirm = (review) => {
        setSelectedReviewToDelete(review);
        setOpenDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setOpenDeleteConfirm(false);
        setSelectedReviewToDelete(null);
    };

    const handleDeleteReview = async () => {
        if (!selectedReviewToDelete) return;
        const idToDelete = selectedReviewToDelete.reportID;

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
            const response = await fetch(`${REVIEWS_API}/${idToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok && response.status !== 204) {
                let errorMsg = `Failed to delete review. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* Ignore if error response is not JSON */ }
                throw new Error(errorMsg);
            }

            fetchReviews(); // Refetch data after successful deletion
            handleCloseDeleteConfirm();
        } catch (e) {
            setError(e.message || "An error occurred while deleting the review.");
            handleCloseDeleteConfirm();
        } finally {
            setMutationLoading(false);
        }
    };

    const handleOpenEditDialog = (review) => {
        setSelectedReviewToEdit(review);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedReviewToEdit(null);
    };

    const handleSaveEditedReview = () => {
        fetchReviews(); // Refetch reviews after successful edit
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredReviews = reviews.filter((review) =>
        (review.reportID?.toString() || '').includes(searchTerm.toLowerCase()) ||
        (review.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (review.booking?.bookingID?.toString() || '').includes(searchTerm.toLowerCase()) ||
        (review.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const displayedReviews = filteredReviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ padding: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h4" gutterBottom>
                Manage Reviews
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorOutlineIcon />}>
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search Reviews..."
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
                    <Table aria-label="reviews table">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                <TableCell>ID</TableCell>
                                <TableCell>User Email</TableCell>
                                <TableCell>Booking ID</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell>Comment</TableCell>
                                <TableCell>Review Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedReviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        {searchTerm ? 'No reviews match your search.' : 'No reviews found.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayedReviews.map((review) => (
                                    <TableRow key={review.reportID} hover>
                                        <TableCell>{review.reportID}</TableCell>
                                        <TableCell>{review.user?.email || 'N/A'}</TableCell>
                                        <TableCell>{review.booking?.bookingID || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Rating name={`review-rating-${review.reportID}`} value={review.rating} readOnly />
                                        </TableCell>
                                        <TableCell>{review.comment || 'N/A'}</TableCell>
                                        <TableCell>{review.reviewDate ? format(new Date(review.reviewDate), 'yyyy-MM-dd HH:mm') : 'N/A'}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenEditDialog(review)}
                                                disabled={mutationLoading}
                                                title="Edit Review"
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDeleteConfirm(review)}
                                                disabled={mutationLoading}
                                                title="Delete Review"
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
                        count={filteredReviews.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </StyledTableContainer>
            )}

            {/* Delete Confirmation */}
            <DeleteReviewDialog
                open={openDeleteConfirm}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleDeleteReview}
                reviewId={selectedReviewToDelete?.reportID}
            />

            {/* Edit Review Dialog */}
            <EditReviewDialog
                open={openEditDialog}
                onClose={handleCloseEditDialog}
                onSave={handleSaveEditedReview}
                review={selectedReviewToEdit}
            />
        </Box>
    );
}