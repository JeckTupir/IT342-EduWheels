import React, { useState } from 'react';
import './SignUpPage.css';
import { TextField, Button, Grid, Box, Typography, IconButton, Divider, CircularProgress, Alert } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import busLogo from '/assets/eduwheels-logo.png';
import backgroundImage from '/assets/background-image.png';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import {Link} from "react-router-dom";

const API_BASE_URL = "https://it342-eduwheels.onrender.com";

export default function Signup() {
    const [formData, setFormData] = useState({
        schoolid: '',
        email: '',
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const formatSchoolId = (value) => {
        const digits = value.replace(/\D/g, '');
        const parts = [];
        if (digits.length > 0) parts.push(digits.substring(0, 2));
        if (digits.length > 2) parts.push(digits.substring(2, 6));
        if (digits.length > 6) parts.push(digits.substring(6, 9));
        return parts.join('-');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'schoolid') {
            newValue = formatSchoolId(value);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue
        }));

        if (error) setError(null);
        if (success) setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const payload = {
            schoolid: formData.schoolid.replace(/-/g, ''),
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            password: formData.password,
            role: "User"
        };

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/users/signup`, payload);
            if (response.status === 201) {
                setSuccess("Sign Up Successful! Redirecting to login...");
                setTimeout(() => {
                    window.location.href = 'login';
                }, 2000);
            } else {
                setError(`Unexpected success status: ${response.status}`);
            }
        } catch (err) {
            console.error("Signup error:", err);
            if (err.response) {
                const backendError = err.response.data?.error || err.response.data?.message;
                if (err.response.status === 400 && backendError) {
                    setError(`Sign Up Failed: ${backendError}`);
                } else {
                    setError("Sign Up Failed: Please try again.");
                }
            } else {
                setError(`Sign Up Failed: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        window.location.href = '/';
    };

    const handleGoogleSignup = () => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    };


    return (
        <div className="signup-page">
            <Box
                className="signup-container"
                style={{
                    backgroundImage: `linear-gradient(rgba(90,64,64,0.6), rgba(202,135,135,0.6)), url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <Box className="signup-form">
                    <IconButton className="back-button" onClick={handleBack}>
                        <ArrowBackIosIcon style={{ color: '#5A4040' }} />
                    </IconButton>
                    <Box className="logo-section">
                        <img src={busLogo} alt="Bus Logo" className="logo" />
                        <Typography variant="h5" className="logo-text"></Typography>
                    </Box>

                    {error && <Alert severity="error" style={{ marginBottom: '1rem' }}>{error}</Alert>}
                    {success && <Alert severity="success" style={{ marginBottom: '1rem' }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2} className="form-grid">
                            <Grid item xs={6}>
                                <TextField
                                    label="School ID (XX-XXXX-XXX)"
                                    name="schoolid"
                                    value={formData.schoolid}
                                    onChange={handleChange}
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    required
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} variant="outlined" fullWidth size="small" required />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} variant="outlined" fullWidth size="small" required />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} variant="outlined" fullWidth size="small" required />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Username" name="username" value={formData.username} onChange={handleChange} variant="outlined" fullWidth size="small" required />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} variant="outlined" fullWidth size="small" required />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField label="Re-Enter Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} variant="outlined" fullWidth size="small" required />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            className="signup-button"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                        </Button>
                    </form>

                    <Divider style={{ margin: '20px 0', color: '#ffffff' }}>OR</Divider>

                    {/* Modified Google Signup Button */}
                    <Button
                        onClick={handleGoogleSignup}
                        variant="contained"
                        fullWidth
                        style={{
                            backgroundColor: '#ffffff',
                            color: '#444',
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textTransform: 'none',
                            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.25)',
                            marginBottom: '10px'
                        }}
                    >
                        <FcGoogle size={24} />
                        <span style={{ marginLeft: 10, fontWeight: 500 }}>
                            Sign Up with Google
                        </span>
                    </Button>

                    <Typography className="login-switch" style={{ textAlign: 'center', color: '#ffffff' }}>
                        Already have an account?
                        <Button color="#5A4040" component={Link} to="/login">Login</Button>
                    </Typography>
                </Box>
            </Box>
        </div>
    );
}