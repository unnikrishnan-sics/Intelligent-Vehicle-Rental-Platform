import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyBookings, reset } from '../redux/slices/bookingSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Map, Calendar, Clock, ShieldCheck, Navigation } from 'lucide-react';
import LiveMap from '../components/LiveMap';
import { io } from 'socket.io-client';
import './UserDashboard.css';

const UserDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { bookings, isLoading, isError, message } = useSelector(
        (state) => state.bookings
    );

    const simulationWorker = useRef(null);
    const watchId = useRef(null);
    const socketRef = useRef(null);
    const simulatedPos = useRef({ lat: 20.5937, lng: 78.9629 });
    const lastGpsUpdate = useRef(0);

    // Initialize Socket and Worker
    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

        // Initialize Web Worker
        simulationWorker.current = new Worker('/gps-worker.js');

        // Worker Message Handler (The Heartbeat)
        simulationWorker.current.onmessage = (e) => {
            if (e.data.type === 'tick') {
                handleSimulationTick(); // Logic moved to function reference
            }
        };

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (simulationWorker.current) simulationWorker.current.terminate();
        };
    }, []);

    // Stored ref for active bookings to be accessible inside Worker callback
    const activeBookingsRef = useRef([]);

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

    // Update the ref whenever bookings change so the tick handler sees fresh data
    useEffect(() => {
        // Track both Active and Confirmed (for demo immediate start)
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

        // CHECK: Has real GPS updated recently?
        const now = Date.now();
        const timeSinceLastGps = now - lastGpsUpdate.current;

        // If GPS is active and fresh (updated in last 5 seconds), don't simulate
        if (timeSinceLastGps < 5000) {
            return;
        }

        // Fallback: GPS is silent (tab minimized?) -> Run Simulation
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
        if (simulationWorker.current) {
            simulationWorker.current.postMessage({ action: 'stop' });
        }
        if (watchId.current && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId.current);
        }
    };

    const startAutoTracking = (activeBookings) => {
        // ALWAYS start the worker heartbeat (it acts as a watchdog now)
        if (simulationWorker.current) {
            simulationWorker.current.postMessage({ action: 'start', delay: 3000 });
        }

        // Try getting real location
        if (navigator.geolocation) {
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // Update timestamp to prove GPS is alive
                    lastGpsUpdate.current = Date.now();

                    // Sync sim pos so fallback is smooth
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
                (error) => {
                    console.warn("Location access denied/failed/throttled. Worker will handle simulation.");
                    // No action needed: lastGpsUpdate will stay old, Worker will pick it up
                },
                { enableHighAccuracy: true }
            );
        }
    };

    // Filter active vehicles for the map
    const activeVehicles = bookings
        .filter(b => (b.status === 'active' || b.status === 'confirmed') && b.vehicle)
        .map(b => b.vehicle);

    if (isLoading) {
        return <div className="text-center mt-20">Loading dashboard...</div>;
    }

    return (
        <div className="user-dashboard-container container mx-auto px-4 py-8">
            <div className="dashboard-header mb-8 border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user && user.name}</h1>
                <p className="text-gray-500">Manage your bookings and track your active rentals.</p>
            </div>

            <div className="dashboard-content grid lg:grid-cols-3 gap-8">
                {/* Live Tracking Section - Only show if there are active rentals */}
                {activeVehicles.length > 0 && (
                    <section className="live-tracking-section lg:col-span-2">
                        <div className="section-header flex items-center justify-between gap-2 mb-4">
                            <div className="flex items-center gap-2">
                                <Map className="text-blue-600" size={24} />
                                <h2 className="text-xl font-bold m-0">Live Tracking</h2>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold animate-pulse">
                                <ShieldCheck size={16} />
                                <span>GPS Monitoring Active</span>
                            </div>
                        </div>
                        <div className="live-map-wrapper bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ minHeight: '400px' }}>
                            <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    Live Telemetry Active - Sharing location with Admin
                                </span>
                            </div>
                            <LiveMap vehicles={activeVehicles} />
                        </div>
                    </section>
                )}

                <section className={`bookings-section ${activeVehicles.length > 0 ? '' : 'lg:col-span-3'}`}>
                    <div className="section-header flex items-center gap-2 mb-4">
                        <Calendar className="text-indigo-600" size={24} />
                        <h2 className="text-xl font-bold m-0">My Bookings</h2>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="empty-state text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition" onClick={() => navigate('/vehicles')}>
                                Browse Vehicles
                            </button>
                        </div>
                    ) : (
                        <div className="bookings-list flex flex-col gap-6">
                            {bookings.map((booking) => (
                                <div key={booking._id} className="booking-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                                    {/* Vehicle Image - Fixed styling to prevent overflow */}
                                    <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 relative bg-gray-100">
                                        <img
                                            src={booking.vehicle?.images[0] || 'https://via.placeholder.com/300x200'}
                                            alt={booking.vehicle?.make}
                                            className="w-full h-full object-cover absolute inset-0"
                                        />
                                    </div>

                                    {/* Booking Details */}
                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{booking.vehicle?.make} {booking.vehicle?.model}</h3>
                                                    <p className="text-gray-500 font-medium">{booking.vehicle?.licensePlate}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-indigo-500" />
                                                    <span>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-indigo-500" />
                                                    <span>{Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} Days</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Total Amount</p>
                                                <p className="text-2xl font-bold text-indigo-600">${booking.totalPrice}</p>
                                            </div>

                                            {booking.status === 'active' && (
                                                <div className="text-xs text-green-600 flex items-center gap-1 font-semibold">
                                                    <Navigation size={14} className="animate-spin-slow" />
                                                    Tracking Active
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default UserDashboard;
