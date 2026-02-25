import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../redux/slices/authSlice';
import { Menu, X, Car, User, LogOut, LayoutDashboard, Calendar, ChevronDown, UserCircle, Settings } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

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
                                <>
                                    <Link to="/bookings" className="nav-link flex items-center gap-2 hover:text-blue-600 font-medium">
                                        <Calendar size={18} />
                                        My Bookings
                                    </Link>
                                    <Link to="/support" className="nav-link flex items-center gap-2 hover:text-blue-600 font-medium">
                                        <Menu size={18} />
                                        Support
                                    </Link>
                                </>
                            )}

                            {/* User Profile Dropdown */}
                            <div className="profile-dropdown-container" ref={dropdownRef}>
                                <button
                                    onClick={toggleDropdown}
                                    className={`nav-link profile-trigger ${isDropdownOpen ? 'active' : ''}`}
                                >
                                    <div className="avatar-sm">
                                        {(user?.user?.name || user?.name)?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="profile-name">
                                        {user?.user?.name || user?.name || 'My Account'}
                                    </span>
                                    <ChevronDown size={14} className={`dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="dropdown-menu animate-fade-in">
                                        <div className="dropdown-header">
                                            <p className="user-email">{user?.user?.email || user?.email}</p>
                                        </div>
                                        <div className="dropdown-divider"></div>

                                        <Link
                                            to={user?.user?.role === 'admin' ? "/admin" : "/bookings"}
                                            className="dropdown-item"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <LayoutDashboard size={16} />
                                            {user?.user?.role === 'admin' ? 'Admin Panel' : 'My Bookings'}
                                        </Link>

                                        {!(user?.user?.role === 'admin') && (
                                            <Link
                                                to="/bookings"
                                                state={{ tab: 'profile' }}
                                                className="dropdown-item"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <UserCircle size={16} />
                                                Manage Profile
                                            </Link>
                                        )}

                                        <div className="dropdown-divider"></div>
                                        <button onClick={() => { onLogout(); setIsDropdownOpen(false); }} className="dropdown-item text-danger">
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
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
                    {user && !(user?.user?.role === 'admin') && (
                        <Link to="/support" className="nav-link" style={{ display: 'block', padding: '0.5rem 0' }}>Support</Link>
                    )}
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
