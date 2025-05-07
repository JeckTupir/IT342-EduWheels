import React, { useEffect } from 'react';
import axios from 'axios';
import { parseJwt } from './parseJwt';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = "https://it342-eduwheels.onrender.com";

export default function OAuthCallbackHandler() {
    const navigate = useNavigate();
    const { search } = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(search);
        const isPending = params.get('pending') === 'true';
        const token = params.get('token');

        if (isPending) {
            navigate('/complete-profile');
            return;
        }

        if (token) {
            // Store JWT
            localStorage.setItem('token', token);

            // Parse out the username claim
            const claims = parseJwt(token);
            const tokenUsername = claims.username || claims.sub || '';

            (async () => {
                let user = {};
                try {
                    const resp = await axios.get(`${API_BASE_URL}/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    user = resp.data;
                } catch (err) {
                    console.warn('Couldn’t fetch /users/me, falling back to token:', err);
                }

                // Ensure we carry over username
                if (!user.username) {
                    user.username = tokenUsername;
                }

                localStorage.setItem('user', JSON.stringify(user));
                navigate('/logged-in');
            })();

            return;
        }

        navigate('/login');
    }, [navigate, search]);

    return <div>Finishing login…</div>;
}
