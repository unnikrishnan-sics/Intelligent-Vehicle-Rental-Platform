import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyBookings, reset } from '../redux/slices/bookingSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Map, Calendar, Clock, ShieldCheck, Navigation, User, LayoutDashboard, LogOut } from 'lucide-react';
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

    const [activeTab, setActiveTab] = useState('dashboard');

    const simulationWorker = useRef(null);
    const watchId = useRef(null);
    const socketRef = useRef(null);
    const simulatedPos = useRef({ lat: 20.5937, lng: 78.9629 });
    const lastGpsUpdate = useRef(0);

    // Check for navigation state to set initial tab
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location]);

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

    const handleLogout = () => {
        dispatch(logout());
        dispatch(authReset());
        navigate('/');
    };

    // Filter active vehicles for the map
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-white border-r border-gray-200 shadow-sm z-10">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 truncate max-w-[140px]">{user?.name}</h3>
                                <p className="text-xs text-gray-500">Member</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <LayoutDashboard size={20} />
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <User size={20} />
                                Manage Profile
                            </button>
                        </nav>

                        <div className="mt-auto pt-8 border-t border-gray-100 mt-8">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                                    <p className="text-gray-500 mt-1">Track your rentals and view booking history.</p>
                                </div>
                            </div>

                            {/* Live Tracking Section */}
                            {activeVehicles.length > 0 && (
                                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Map className="text-blue-600" size={20} />
                                            <h2 className="font-bold text-gray-800">Live Active Rentals</h2>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse">
                                            <ShieldCheck size={14} />
                                            <span>GPS Active</span>
                                        </div>
                                    </div>
                                    <div className="h-[400px]">
                                        <LiveMap vehicles={activeVehicles} />
                                    </div>
                                </section>
                            )}

                            {/* Bookings List */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="text-indigo-600" size={20} />
                                    <h2 className="text-lg font-bold text-gray-800">My Bookings</h2>
                                </div>

                                {bookings.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="text-gray-400" size={32} />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
                                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by browsing our available vehicles for your next trip.</p>
                                        <button
                                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
                                            onClick={() => navigate('/vehicles')}
                                        >
                                            Browse Vehicles
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {bookings.map((booking) => (
                                            <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                                                {/* Vehicle Image */}
                                                <div className="w-full md:w-72 h-48 md:h-auto flex-shrink-0 relative bg-gray-100">
                                                    <img
                                                        src={booking.vehicle?.images?.[0] || 'https://via.placeholder.com/300x200'}
                                                        alt={booking.vehicle?.make || 'Vehicle'}
                                                        className="w-full h-full object-cover absolute inset-0"
                                                    />
                                                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                                                        ${booking.status === 'confirmed' ? 'bg-green-500 text-white' :
                                                            booking.status === 'active' ? 'bg-blue-500 text-white' :
                                                                booking.status === 'pending' ? 'bg-yellow-500 text-white' :
                                                                    booking.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>
                                                        {booking.status}
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="p-6 flex-grow flex flex-col">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900">{booking.vehicle?.make} {booking.vehicle?.model}</h3>
                                                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                                {booking.vehicle?.licensePlate}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-500 mb-1">Total</p>
                                                            <p className="text-2xl font-bold text-indigo-600">${booking.totalPrice}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                        <div>
                                                            <p className="text-xs text-gray-400 uppercase mb-1">Pick-up</p>
                                                            <div className="font-semibold flex items-center gap-2">
                                                                <Calendar size={14} className="text-blue-500" />
                                                                {new Date(booking.startDate).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 uppercase mb-1">Drop-off</p>
                                                            <div className="font-semibold flex items-center gap-2">
                                                                <Calendar size={14} className="text-blue-500" />
                                                                {new Date(booking.endDate).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 pt-2 border-t border-gray-200 md:col-span-1 md:pt-0 md:border-0">
                                                            <p className="text-xs text-gray-400 uppercase mb-1">Duration</p>
                                                            <div className="font-semibold flex items-center gap-2">
                                                                <Clock size={14} className="text-blue-500" />
                                                                {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} Days
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {booking.status === 'active' && (
                                                        <div className="mt-auto bg-blue-50 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium border border-blue-100">
                                                            <div className="relative">
                                                                <Navigation size={18} className="text-blue-600" />
                                                                <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                                                            </div>
                                                            Tracking Active - View at top of dashboard
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="animate-fade-in max-w-4xl mx-auto">
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-900">Manage Profile</h1>
                                <p className="text-gray-500 mt-1">Update your personal information and license details.</p>
                            </div>
                            <UserProfile />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserDashboard;
