import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, Car, Calendar, Activity, Map } from 'lucide-react';
import { getVehicles } from '../../redux/slices/vehicleSlice';
import LiveMap from '../../components/LiveMap';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { vehicles } = useSelector((state) => state.vehicles);

    const [dashboardStats, setDashboardStats] = useState({
        users: 0,
        vehicles: 0,
        activeBookings: 0,
        revenue: 0
    });
    const { user } = useSelector((state) => state.auth);

    // Fetch vehicles for map and stats
    useEffect(() => {
        dispatch(getVehicles());

        const fetchStats = async () => {
            try {
                // api instance handles token and base URL automatically
                const response = await api.get('admin/stats');
                setDashboardStats(response.data);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [dispatch, user]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const stats = [
        { title: 'Total Users', value: dashboardStats.users.toString(), icon: <Users size={24} />, color: 'blue', link: '/admin/users' },
        { title: 'Total Vehicles', value: dashboardStats.vehicles.toString(), icon: <Car size={24} />, color: 'green', link: '/admin/vehicles' },
        // { title: 'Active Bookings', value: dashboardStats.activeBookings.toString(), icon: <Calendar size={24} />, color: 'purple', link: '/admin/bookings' },
        { title: 'Revenue', value: formatCurrency(dashboardStats.revenue), icon: <Activity size={24} />, color: 'yellow', link: '#' },
    ];

    return (
        <div className="admin-dashboard">
            <h1 className="dashboard-title">Dashboard Overview</h1>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <Link to={stat.link} key={index} className="stat-card">
                        <div className="stat-header">
                            <div className={`stat-icon-wrapper icon-${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className={`stat-trend trend-positive`}>
                                +5%
                            </span>
                        </div>
                        <h3 className="stat-title">{stat.title}</h3>
                        <p className="stat-value">{stat.value}</p>
                    </Link>
                ))}
            </div>

            <div className="dashboard-content-grid">
                {/* Live Map Section - Commented out as requested */}
                {/* <div className="dashboard-card col-span-2">
                    <div className="card-header flex justify-between items-center mb-4">
                        <h2 className="card-title flex items-center gap-2">
                            <Map size={20} className="text-blue-500" /> Live Fleet Tracking
                        </h2>
                        <span className="text-sm text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Updates
                        </span>
                    </div>
                    <LiveMap vehicles={vehicles} />
                </div> */}

                <div className="dashboard-card">
                    <h2 className="card-title">Recent Activity</h2>
                    <div className="activity-list">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="activity-item">
                                <div className="activity-icon">
                                    <Users size={16} />
                                </div>
                                <div>
                                    <p className="activity-desc">New user registered</p>
                                    <p className="activity-time">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-card">
                    <h2 className="card-title">Quick Actions</h2>
                    <div className="quick-actions-grid">
                        <Link to="/admin/vehicles" className="action-card">
                            <div className="action-icon text-blue">
                                <Car size={24} />
                            </div>
                            <span className="action-label">Add Vehicle</span>
                        </Link>
                        <Link to="/admin/users" className="action-card">
                            <div className="action-icon text-green">
                                <Users size={24} />
                            </div>
                            <span className="action-label">Manage Users</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
