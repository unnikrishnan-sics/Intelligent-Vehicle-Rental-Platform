import api from '../utils/api';

// Register user
const register = async (userData) => {
    const response = await api.post('auth/register', userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await api.post('auth/login', userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

// Update user details
const updateDetails = async (userData) => {
    const response = await api.put('auth/updatedetails', userData);

    if (response.data) {
        // Update user in local storage but keep the token!
        // The backend returns the updated user object (without token usually, unless we regenerate it)
        // If backend returns only user, we need to merge it with existing token in LS
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = { ...currentUser, ...response.data, token: currentUser.token }; // Ensure token is preserved if not returned
        // Actually, usually we store {token, user: {...}} or just {...user, token}. 
        // Let's check how login stores it.
        // Login returns { token, user: { id, name, role } }.
        // The updateDetails controller returns just the user object.
        // So we should update result.user

        const newStorageData = { ...currentUser, user: response.data };
        localStorage.setItem('user', JSON.stringify(newStorageData));
        return newStorageData;
    }

    return response.data;
};

const authService = {
    register,
    login,
    logout,
    updateDetails,
};

export default authService;
