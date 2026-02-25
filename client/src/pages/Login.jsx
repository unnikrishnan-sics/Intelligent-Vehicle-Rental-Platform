import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, reset } from '../redux/slices/authSlice';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        if (isSuccess || user) {
            if (user?.user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/bookings');
            }
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    // Clear state on mount to prevent old errors from showing
    useEffect(() => {
        dispatch(reset());
    }, [dispatch]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        // Real-time validation
        if (name === 'email') {
            if (value && !validateEmail(value)) {
                setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
            } else {
                setErrors((prev) => ({ ...prev, email: null }));
            }
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();

        if (errors.email) {
            return toast.error(errors.email);
        }

        const userData = {
            email,
            password,
        };

        dispatch(login(userData));
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Sign In</h2>
                    <p className="auth-subtitle">
                        Or <Link to="/register">create a new account</Link>
                    </p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <div className="input-group">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                className={`form-control with-icon ${errors.email ? 'invalid' : ''}`}
                                id="email"
                                name="email"
                                value={email}
                                placeholder="Email Address"
                                onChange={onChange}
                                required
                            />
                        </div>
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <div className="input-group">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control with-icon with-toggle-icon"
                                id="password"
                                name="password"
                                value={password}
                                placeholder="Password"
                                onChange={onChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end mb-4">
                        <Link to="/forgot-password" style={{ color: '#2563eb', fontSize: '0.9rem', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
