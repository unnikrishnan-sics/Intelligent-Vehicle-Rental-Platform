import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, reset } from '../redux/slices/authSlice';
import { User, Mail, Lock } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { name, email, password, confirmPassword } = formData;

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
            navigate('/bookings');
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
        } else {
            const userData = {
                name,
                email,
                password,
            };

            dispatch(register(userData));
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            className="form-control with-icon"
                            id="name"
                            name="name"
                            value={name}
                            placeholder="Full Name"
                            onChange={onChange}
                            required
                        />
                    </div>

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

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            className="form-control with-icon"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            placeholder="Confirm Password"
                            onChange={onChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
