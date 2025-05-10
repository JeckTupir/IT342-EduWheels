import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemText, CircularProgress, Rating } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

export default function DashboardContent() {
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingRes, reviewRes] = await Promise.all([
                    axios.get('https://it342-eduwheels.onrender.com/api/bookings'),
                    axios.get('https://it342-eduwheels.onrender.com/api/reviews')
                ]);
                setBookings(bookingRes.data);
                setReviews(reviewRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const bookingTrends = bookings.reduce((acc, booking) => {
        const month = new Date(booking.startDate).toLocaleString('default', { month: 'short' });
        const found = acc.find(item => item.name === month);
        if (found) {
            found.bookings += 1;
        } else {
            acc.push({ name: month, bookings: 1 });
        }
        return acc;
    }, []);

    const statusCounts = bookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));

    const pendingRequests = bookings.filter(b => b.status.toLowerCase() === 'pending');

    const latestReviews = [...reviews].sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate)).slice(0, 5);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, height: 360 }}>
                        <Typography variant="h6" gutterBottom>
                            Booking Trends
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bookingTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="bookings" stroke="#5A4040" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: 360 }}>
                        <Typography variant="h6" gutterBottom>
                            Booking Status
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 360, overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Pending Booking Requests
                        </Typography>
                        <List>
                            {pendingRequests.map((request) => (
                                <ListItem key={request.id} divider>
                                    <ListItemText
                                        primary={`Plate: ${request.plateNumber} | Pick-up: ${request.pickUp} | Drop-off: ${request.dropOff}`}
                                        secondary={`Date: ${new Date(request.startDate).toLocaleDateString()} | Status: ${request.status}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 360, overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Latest Reviews
                        </Typography>
                        <List>
                            {latestReviews.map((review) => (
                                <ListItem key={review.id} divider>
                                    <ListItemText
                                        primary={`User: ${review.user?.name || 'Anonymous'} | Booking: ${review.booking?.plateNumber || 'N/A'}`}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {review.comment}
                                                </Typography>
                                                <br />
                                                <Rating value={review.rating} readOnly size="small" />
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
