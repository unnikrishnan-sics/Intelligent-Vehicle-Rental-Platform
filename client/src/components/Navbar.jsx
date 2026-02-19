import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../redux/slices/authSlice';
import { Menu, X, Car, User, LogOut, LayoutDashboard, Calendar } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="nav-brand">
                    <Car className="logo-icon text-blue-600" size={32} />
                    <span className="font-bold text-xl tracking-tight">Intelli<span className="text-blue-600">Drive</span></span>
                </Link>

                {/* Desktop Menu */}
                <div className="auth-nav">
                    {/* Public Links - Hide for Admin */}
                    {!(user?.user?.role === 'admin') && (
                        <>
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/vehicles" className="nav-link">Vehicles</Link>
                        </>
                    )}

                    {user ? (
                        <>
                            {/* Standard User Links */}
                            {!(user?.user?.role === 'admin') && (
                                <Link to="/bookings" className="nav-link flex items-center gap-2 hover:text-blue-600 font-medium">
                                    <Calendar size={18} />
                                    My Bookings
                                </Link>
                            )}

                            {/* User Profile - Shown for Both (Admin goes to Admin Panel) */}
                            <Link
                                to={user?.user?.role === 'admin' ? "/admin" : "/bookings"}
                                className="nav-link flex items-center gap-2 hover:text-blue-600 font-medium"
                            >
                                <User size={18} />
                                {user?.name || user?.user?.name || 'My Account'}
                            </Link>

                            <button onClick={onLogout} className="nav-link btn-danger">
                                <LogOut size={18} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Basic Mobile Menu Implementation */}
            {isOpen && (
                <div className="mobile-menu" style={{ display: isOpen ? 'block' : 'none', padding: '1rem', background: 'white', borderTop: '1px solid #eee', position: 'absolute', top: '100%', left: 0, right: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <Link to="/" className="nav-link" style={{ display: 'block', padding: '0.5rem 0' }}>Home</Link>
                    <Link to="/vehicles" className="nav-link" style={{ display: 'block', padding: '0.5rem 0' }}>Vehicles</Link>
                    {!user && (
                        <>
                            <Link to="/login" className="nav-link" style={{ display: 'block', padding: '0.5rem 0' }}>Login</Link>
                            <Link to="/register" className="nav-link" style={{ display: 'block', padding: '0.5rem 0' }}>Register</Link>
                        </>
                    )}
                    {user && (
                        <button onClick={onLogout} className="nav-link btn-danger" style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0' }}>Logout</button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
