import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/',
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
let isAlertShown = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Check if we already handled this recently to avoid spam
            if (!isAlertShown) {
                isAlertShown = true;
                toast.error('Session expired. Please login again.');

                localStorage.removeItem('user');
                // Redirect logic or dispatch logout action
                // Since we are outside React components, we use window.location
                setTimeout(() => {
                    window.location.href = '/login';
                    isAlertShown = false; // Reset after redirect
                }, 1500);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
