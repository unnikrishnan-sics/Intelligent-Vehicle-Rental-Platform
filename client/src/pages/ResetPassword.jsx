import { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';
import { Lock } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setIsLoading(true);

        try {
            const res = await api.put(`/auth/resetpassword/${token}`, { password });
            toast.success(res.data.data);
            dispatch(logoutUser()); // Clear old session/token from Redux & LocalStorage
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Reset Password</h2>
                    <p className="auth-subtitle">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            className="form-control with-icon"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            className="form-control with-icon"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
