import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Container, Grid, Avatar, Link,
    Card, CardContent, CardActions, Divider
} from '@mui/material';

import busLogo from '/assets/bus-logo.png';
import './AboutUs.css';

const teamMembers = [
    { username: 'Amarok1214', role: 'Backend Developer' },
    { username: 'JeckTupir', role: 'Frontend Developer' },
    { username: 'KArruuuu', role: 'Mobile App Developer' },
];

const AboutUs = () => {
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeamData = async () => {
            setLoading(true);
            setError(null);
            try {
                const promises = teamMembers.map(async (member) => {
                    const res = await fetch(`https://api.github.com/users/${member.username}`);
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const userData = await res.json();
                    return { ...userData, role: member.role };
                });
                const results = await Promise.all(promises);
                setTeamData(results);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTeamData();
    }, []);

    return (
        <Container className="about-us-container" maxWidth="md">
            <Box sx={{ my: 5 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <img alt="EduWheels Logo" src={busLogo} className="eduwheels-logo" />
                    <Typography variant="h3" className="about-us-title">About EduWheels</Typography>
                    <Typography variant="body1" className="about-us-description">
                        Welcome to EduWheels, a vehicle management system built for the Cebu Institute of Technology – University (CIT-U).
                        Our mission is to streamline transport operations for students, faculty, and staff.
                    </Typography>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h4" className="our-mission-title">Our Mission</Typography>
                <Typography variant="body1" className="our-mission-description">
                    We strive to enhance transportation at CIT-U through:
                    <ul className="mission-points">
                        <li>Ensuring safety and well-being.</li>
                        <li>Optimizing schedules and routes.</li>
                        <li>Streamlining booking processes.</li>
                        <li>Timely, clear communication.</li>
                        <li>Promoting sustainability.</li>
                    </ul>
                </Typography>

                <Typography variant="h4" className="our-vision-title">Our Vision</Typography>
                <Typography variant="body1" className="our-vision-description">
                    To become the region’s go-to transport system for educational institutions—safe, efficient, and trusted.
                </Typography>

                <Typography variant="h4" className="our-commitment-title">Our Commitment</Typography>
                <Typography variant="body1" className="our-commitment-description">
                    We continuously evolve EduWheels based on user feedback, ensuring reliable, modern solutions for the CIT-U community.
                </Typography>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h4" className="our-team-title">Our Team</Typography>
                {loading ? (
                    <Typography>Loading team profiles...</Typography>
                ) : error ? (
                    <Typography color="error">Error: {error}</Typography>
                ) : (
                    <Grid container spacing={3} justifyContent="center">
                        {teamData.map((member) => (
                            <Grid item xs={12} sm={6} md={4} key={member.id}>
                                <Card className="team-card" elevation={3}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Avatar alt={member.name} src={member.avatar_url} sx={{ width: 72, height: 72, mx: 'auto', mb: 1 }} />
                                        <Typography variant="subtitle1">{member.name || member.login}</Typography>
                                        <Typography variant="caption" color="text.secondary">{member.role}</Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'center' }}>
                                        <Link href={member.html_url} target="_blank" rel="noopener noreferrer">
                                            GitHub
                                        </Link>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default AboutUs;
