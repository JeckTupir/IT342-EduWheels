import React, { useState } from 'react';
import './LoginPage.css';
import {
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Divider
} from '@mui/material';
import { FcGoogle } from 'react-icons/fc';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import busLogo from '/assets/eduwheels-logo.png';
import backgroundImage from '/assets/background-image.png';
import axios from 'axios';

const API_BASE_URL = "https://it342-eduwheels.onrender.com";

export default function Login() {
    const [formData, setFormData] = useState({
        schoolid: '',
        password: ''
    });

    const formatSchoolId = (value) => {
        const cleaned = value.replace(/\D/g, '');
        return cleaned.replace(/^(\d{2})(\d{4})(\d{3}).*/, '$1-$2-$3').slice(0, 11);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'schoolid' ? formatSchoolId(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const rawSchoolId = formData.schoolid.replace(/-/g, '');
            const response = await axios.post(
                `${API_BASE_URL}/users/login`,
                { schoolid: rawSchoolId, password: formData.password },
                { withCredentials: true }
            );

            if (response.status === 200) {
                const { user, token } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = '/';
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.status === 401) {
                alert('Invalid credentials. Please try again.');
            } else {
                alert('Login failed! Please try again later.');
            }
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleBack = () => {
        window.location.href = '/';
    };

    return (
        <div className="login-page">
            <Box
                className="login-container"
                style={{
                    backgroundImage: `linear-gradient(rgba(90,64,64,0.6), rgba(202,135,135,0.6)), url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <Box className="login-form">
                    <IconButton className="back-button" onClick={handleBack}>
                        <ArrowBackIosIcon style={{ color: '#5A4040' }} />
                    </IconButton>

                    <Box className="logo-section">
                        <img src={busLogo} alt="Bus Logo" className="logo" />
                    </Box>

                    {/* Standard Login Form */}
                    <form onSubmit={handleSubmit} className="login-input-form">
                        <TextField
                            label="School ID (e.g., 12-3456-789)"
                            name="schoolid"
                            value={formData.schoolid}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            size="small"
                            margin="normal"
                            inputProps={{ maxLength: 11 }}
                            placeholder="12-3456-789"
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            variant="outlined"
                            fullWidth
                            size="small"
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            className="login-button"
                        >
                            Log In
                        </Button>
                    </form>

                    <Divider style={{ margin: '20px 0', color: '#ffffff' }}>OR</Divider>

                    {/* Google OAuth2 Login */}
                    <Button
                        onClick={handleGoogleLogin}
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
                            Log In with Google
                        </span>
                    </Button>

                    <Typography
                        className="signup-switch"
                        align="center"
                        style={{ marginTop: '15px' }}
                    >
                        Don't have an account?{' '}
                        <a
                            href="signup"
                            className="signup-text"
                            style={{
                                color: '#ffffff',
                                textDecoration: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Sign Up
                        </a>
                    </Typography>
                </Box>
            </Box>
        </div>
    );
}
