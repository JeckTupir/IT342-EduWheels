import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = "https://it-342-edu-wheels.vercel.app/";

export default function CompleteProfilePage() {
    const [schoolId, setSchoolId] = useState('');
    const [password, setPassword] = useState('');                  // new state
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingUser, setIsFetchingUser] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/users/me`, { withCredentials: true });
                if (res.data.isProfileComplete) window.location.href = '/logged-in';
                else setUserInfo(res.data);
            } catch (err) {
                setError(err.response?.status === 401 ?
                    'Not logged in. Redirecting...' :
                    'Failed to fetch user info.');
                if (err.response?.status === 401)
                    setTimeout(() => window.location.href = '/login', 2000);
            } finally {
                setIsFetchingUser(false);
            }
        };
        fetchUser();
    }, []);

    const formatSchoolId = val => {
        const d = val.replace(/\D/g, '');
        let f = d;
        if (d.length > 2) f = `${d.slice(0,2)}-${d.slice(2)}`;
        if (d.length > 6) f = `${d.slice(0,2)}-${d.slice(2,6)}-${d.slice(6)}`;
        return f.slice(0,11);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const rawSchoolId = schoolId.replace(/-/g, '');
        if (rawSchoolId.length !== 9) {
            setError('Enter valid School ID XX-XXXX-XXX.');
            setIsLoading(false);
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            setIsLoading(false);
            return;
        }
        try {
            const res = await axios.post(
                `${API_BASE_URL}/users/complete-profile`,
                { schoolid: rawSchoolId, password },   // include password
                { withCredentials: true }
            );
            if (res.status === 200) window.location.href = '/logged-in';
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to complete profile.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingUser) return (
        <Container sx={{textAlign:'center', mt:8}}>
            <CircularProgress />
            <Typography mt={2}>Loading...</Typography>
        </Container>
    );

    if (!userInfo) return (
        <Container sx={{mt:8}}>
            <Alert severity="error">{error || 'Unable to load.'}</Alert>
            <Button onClick={() => window.location.href='/login'} sx={{mt:2}}>Login</Button>
        </Container>
    );

    return (
        <Container maxWidth="xs">
            <Box sx={{mt:8,p:3,display:'flex',flexDirection:'column',alignItems:'center',boxShadow:3,borderRadius:2}}>
                <Typography variant="h5">Complete Your Profile</Typography>
                <Typography sx={{mt:1,mb:2}}>Welcome, {userInfo.firstName}! Enter your School ID and set a password.</Typography>
                {error && <Alert severity="error" sx={{width:'100%',mb:2}}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{width:'100%'}}>
                    <TextField
                        margin="normal"
                        required fullWidth
                        label="School ID (XX-XXXX-XXX)"
                        value={schoolId}
                        onChange={e => setSchoolId(formatSchoolId(e.target.value))}
                        inputProps={{ maxLength:11 }}
                    />
                    <TextField
                        margin="normal"
                        required fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        helperText="Minimum 8 characters"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{mt:3,mb:2}}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Save and Continue'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}