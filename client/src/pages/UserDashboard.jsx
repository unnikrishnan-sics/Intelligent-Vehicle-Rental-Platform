import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyBookings, reset } from '../redux/slices/bookingSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Container, Grid, Typography, Tabs, Tab, Box, Card, CardContent, CardMedia, Chip
} from '@mui/material';
import {
    DirectionsCar, History as HistoryIcon, Person, Map, GppGood,
    CalendarToday, Logout as LogOut, Dashboard as LayoutDashboard
} from '@mui/icons-material';
import LiveMap from '../components/LiveMap';
import UserProfile from '../components/UserProfile';
import { logout, reset as authReset } from '../redux/slices/authSlice';
import { io } from 'socket.io-client';
import './UserDashboard.css';

const UserDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const { bookings, isLoading, isError, message } = useSelector(
        (state) => state.bookings
    );

    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history' | 'profile'

    const simulationWorker = useRef(null);
    const watchId = useRef(null);
    const socketRef = useRef(null);
    const simulatedPos = useRef({ lat: 20.5937, lng: 78.9629 });
    const lastGpsUpdate = useRef(0);

    // Initial load check
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location]);

    // Socket & Worker Init
    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        simulationWorker.current = new Worker('/gps-worker.js');

        simulationWorker.current.onmessage = (e) => {
            if (e.data.type === 'tick') {
                handleSimulationTick();
            }
        };

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (simulationWorker.current) simulationWorker.current.terminate();
        };
    }, []);

    // Active bookings ref for worker
    const activeBookingsRef = useRef([]);

    // Fetch Bookings
    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (!user) {
            navigate('/login');
        } else {
            dispatch(getMyBookings());
        }

        return () => {
            dispatch(reset());
            stopTracking();
        };
    }, [user, navigate, isError, message, dispatch]);

    // Tracking Logic
    useEffect(() => {
        const active = bookings.filter(b => (b.status === 'active' || b.status === 'confirmed') && b.vehicle);
        activeBookingsRef.current = active;

        if (active.length > 0) {
            startAutoTracking(active);
        } else {
            stopTracking();
        }
    }, [bookings]);

    const handleSimulationTick = () => {
        const activeBookings = activeBookingsRef.current;
        if (activeBookings.length === 0) return;

        const now = Date.now();
        const timeSinceLastGps = now - lastGpsUpdate.current;

        if (timeSinceLastGps < 5000) return;

        simulatedPos.current.lat += (Math.random() - 0.5) * 0.01;
        simulatedPos.current.lng += (Math.random() - 0.5) * 0.01;

        if (socketRef.current) {
            activeBookings.forEach(booking => {
                socketRef.current.emit('update_location', {
                    vehicleId: booking.vehicle._id,
                    lat: simulatedPos.current.lat,
                    lng: simulatedPos.current.lng
                });
            });
        }
    };

    const stopTracking = () => {
        if (simulationWorker.current) simulationWorker.current.postMessage({ action: 'stop' });
        if (watchId.current && navigator.geolocation) navigator.geolocation.clearWatch(watchId.current);
    };

    const startAutoTracking = (activeBookings) => {
        if (simulationWorker.current) simulationWorker.current.postMessage({ action: 'start', delay: 3000 });

        if (navigator.geolocation) {
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    lastGpsUpdate.current = Date.now();
                    simulatedPos.current = { lat: latitude, lng: longitude };

                    activeBookings.forEach(booking => {
                        if (socketRef.current) {
                            socketRef.current.emit('update_location', {
                                vehicleId: booking.vehicle._id,
                                lat: latitude,
                                lng: longitude
                            });
                        }
                    });
                },
                (error) => console.warn("GPS Access Denied. Using simulation."),
                { enableHighAccuracy: true }
            );
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        dispatch(authReset());
        navigate('/');
    };

    // Filter Bookings
    const activeBookingsList = bookings.filter(b => ['pending', 'confirmed', 'active'].includes(b.status));
    const historyBookingsList = bookings.filter(b => ['completed', 'cancelled', 'failed'].includes(b.status));

    const activeVehicles = bookings
        .filter(b => (b.status === 'active' || b.status === 'confirmed') && b.vehicle)
        .map(b => b.vehicle);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // ... logic remains same ...

    // Styles for MUI Components
    const tabStyle = {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '1rem',
        color: '#6b7280',
        '&.Mui-selected': {
            color: '#2563eb',
        },
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <Container maxWidth="lg">
                    <div className="header-content">
                        <div className="logo-section">
                            <LayoutDashboard style={{ color: '#2563eb' }} />
                            <h1>My Bookings</h1>
                        </div>
                        <div className="user-section">
                            <div className="user-info">
                                <span>Welcome, <b>{user?.name}</b></span>
                                <div className="avatar">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            </div>
                            <button onClick={handleLogout} className="logout-btn">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop: 2 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, val) => setActiveTab(val)}
                            aria-label="dashboard tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="Current Rentals" value="active" icon={<DirectionsCar />} iconPosition="start" sx={tabStyle} />
                            <Tab label="Rental History" value="history" icon={<HistoryIcon />} iconPosition="start" sx={tabStyle} />
                            <Tab label="Manage Profile" value="profile" icon={<Person />} iconPosition="start" sx={tabStyle} />
                        </Tabs>
                    </Box>
                </Container>
            </div>

            <Container maxWidth="lg" className="main-content animate-fade-in">
                {/* Active Tab Content */}
                {activeTab === 'active' && (
                    <Grid container spacing={4}>
                        {/* Live Tracking Section */}
                        {activeVehicles.length > 0 && (
                            <Grid item xs={12}>
                                <div className="live-tracking-card">
                                    <div className="card-header">
                                        <div className="header-title">
                                            <div className="live-indicator">
                                                <span className="ping"></span>
                                                <Map style={{ color: '#2563eb' }} />
                                            </div>
                                            <h2>Live Tracking</h2>
                                        </div>
                                        <div className="gps-badge">
                                            <GppGood style={{ fontSize: 16 }} />
                                            <span>GPS Active</span>
                                        </div>
                                    </div>
                                    <div className="map-container">
                                        <LiveMap vehicles={activeVehicles} />
                                    </div>
                                </div>
                            </Grid>
                        )}

                        {/* Active Bookings List */}
                        <Grid item xs={12}>
                            {activeBookingsList.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <DirectionsCar style={{ fontSize: 40, color: '#60a5fa' }} />
                                    </div>
                                    <h3>No Active Rentals</h3>
                                    <p>You don't have any upcoming or active trips. Ready to hit the road?</p>
                                    <button className="browse-btn" onClick={() => navigate('/vehicles')}>
                                        Browse Vehicles
                                    </button>
                                </div>
                            ) : (
                                <Grid container spacing={3}>
                                    {activeBookingsList.map((booking) => (
                                        <Grid item xs={12} md={6} lg={4} key={booking._id}>
                                            <BookingCard booking={booking} active />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                )}

                {/* History Tab Content */}
                {activeTab === 'history' && (
                    <Box>
                        {historyBookingsList.length === 0 ? (
                            <div className="empty-state">
                                <HistoryIcon style={{ fontSize: 48, color: '#d1d5db' }} />
                                <h3>No History</h3>
                                <p>You haven't completed any rentals yet.</p>
                            </div>
                        ) : (
                            <Grid container spacing={3}>
                                {historyBookingsList.map((booking) => (
                                    <Grid item xs={12} md={6} lg={4} key={booking._id}>
                                        <BookingCard booking={booking} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* Profile Tab Content */}
                {activeTab === 'profile' && (
                    <div className="profile-container">
                        <UserProfile />
                    </div>
                )}
            </Container>
        </div>
    );
};

// Reusable Booking Card Component with MUI
const BookingCard = ({ booking, active }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'primary';
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            case 'completed': return 'default';
            default: return 'default';
        }
    };

    return (
        <Card className={`booking-card ${active ? 'active-card' : ''}`} elevation={active ? 3 : 1}>
            <div className="card-image-container">
                <CardMedia
                    component="img"
                    height="160"
                    image={booking.vehicle?.images?.[0] || 'https://via.placeholder.com/300x200'}
                    alt={booking.vehicle?.make}
                />
                <Chip
                    label={booking.status}
                    color={getStatusColor(booking.status)}
                    size="small"
                    className="status-chip"
                />
            </div>

            <CardContent>
                <div className="card-info-header">
                    <Typography variant="h6" component="div" fontWeight="bold">
                        {booking.vehicle?.make} {booking.vehicle?.model}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        ${booking.totalPrice}
                    </Typography>
                </div>

                <Typography variant="body2" color="text.secondary" className="license-plate">
                    License: {booking.vehicle?.licensePlate}
                </Typography>

                <div className="date-info">
                    <div className="date-item">
                        <Typography variant="caption" display="block" color="text.secondary">PICK-UP</Typography>
                        <div className="date-value">
                            <CalendarToday fontSize="small" color="primary" />
                            <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="date-item">
                        <Typography variant="caption" display="block" color="text.secondary">DROP-OFF</Typography>
                        <div className="date-value">
                            <CalendarToday fontSize="small" color="primary" />
                            <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {active && booking.status === 'active' && (
                    <div className="tracking-status">
                        <span className="live-dot"></span>
                        Tracking Active
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UserDashboard;
