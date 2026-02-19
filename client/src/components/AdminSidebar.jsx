import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout, reset } from '../redux/slices/authSlice';
import { Car, Users, Calendar, LayoutDashboard, LogOut } from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <Car size={28} className="text-primary-400" />
                <span>Admin Panel</span>
            </div>

            <nav className="sidebar-nav">
                <Link
                    to="/admin"
                    className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
                >
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                <Link
                    to="/admin/vehicles"
                    className={`sidebar-link ${isActive('/admin/vehicles') ? 'active' : ''}`}
                >
                    <Car size={20} />
                    Vehicles
                </Link>

                <Link
                    to="/admin/users"
                    className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}
                >
                    <Users size={20} />
                    Users
                </Link>

                {/* <Link
                    to="/admin/bookings"
                    className={`sidebar-link ${isActive('/admin/bookings') ? 'active' : ''}`}
                >
                    <Calendar size={20} />
                    Bookings
                </Link> */}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="sidebar-link logout-btn">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
