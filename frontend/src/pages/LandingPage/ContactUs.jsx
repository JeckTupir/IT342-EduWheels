import React from 'react';
import {
    Box, Typography, Container, Grid, TextField, Button, Link, IconButton, Paper
} from '@mui/material';
import {
    LocationOn as LocationOnIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon
} from '@mui/icons-material';
import './ContactUs.css';

const ContactUs = () => {
    return (
        <Container className="contact-us-container" maxWidth="md">
            <Box sx={{ my: 5 }}>
                <Typography variant="h3" component="h1" gutterBottom className="contact-us-title">
                    Contact Us
                </Typography>
                <Typography variant="body1" paragraph className="contact-us-description">
                    We'd love to hear from you! Reach out for inquiries, feedback, or support using the form or contact info below.
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} className="contact-section-card">
                            <Box p={3}>
                                <Typography variant="h6" gutterBottom className="contact-form-title">
                                    Send Us a Message
                                </Typography>
                                <form className="contact-form">
                                    <TextField fullWidth label="Your Name" variant="outlined" required />
                                    <TextField fullWidth label="Your Email" type="email" variant="outlined" required />
                                    <TextField fullWidth label="Subject" variant="outlined" />
                                    <TextField
                                        fullWidth
                                        label="Message"
                                        variant="outlined"
                                        multiline
                                        rows={4}
                                        required
                                    />
                                    <Button type="submit" variant="contained" size="large" className="contact-submit-btn">
                                        Send Message
                                    </Button>
                                </form>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} className="contact-section-card">
                            <Box p={3}>
                                <Typography variant="h6" gutterBottom className="contact-info-title">
                                    Contact Information
                                </Typography>
                                <Box className="contact-info">
                                    <Box className="contact-line">
                                        <LocationOnIcon color="primary" />
                                        <Typography variant="body2">
                                            Cebu Institute of Technology – University<br />
                                            N. Bacalso Ave, Cebu City, 6000 Cebu, Philippines
                                        </Typography>
                                    </Box>
                                    <Box className="contact-line">
                                        <EmailIcon color="primary" />
                                        <Typography variant="body2">
                                            <Link href="mailto:eduwheels342@gmail.com" underline="hover" color="primary">
                                                eduwheels342@gmail.com
                                            </Link>
                                        </Typography>
                                    </Box>
                                    <Box className="contact-line">
                                        <PhoneIcon color="primary" />
                                        <Typography variant="body2">+63 9162906629</Typography>
                                    </Box>
                                </Box>

                                <Typography variant="h6" gutterBottom className="social-media-title" sx={{ mt: 3 }}>
                                    Connect With Us
                                </Typography>
                                <Box className="social-media-links">
                                    <IconButton color="primary" href="https://www.facebook.com/CITUniversity/" target="_blank">
                                        <FacebookIcon fontSize="large" />
                                    </IconButton>
                                    <IconButton color="primary" href="https://twitter.com/CITUniversity" target="_blank">
                                        <TwitterIcon fontSize="large" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default ContactUs;
