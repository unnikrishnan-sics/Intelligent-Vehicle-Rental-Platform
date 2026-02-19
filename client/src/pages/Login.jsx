import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, reset } from '../redux/slices/authSlice';
import { Mail, Lock } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

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

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

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
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            className="form-control with-icon"
                            id="email"
                            name="email"
                            value={email}
                            placeholder="Email Address"
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            className="form-control with-icon"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="Password"
                            onChange={onChange}
                            required
                        />
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
