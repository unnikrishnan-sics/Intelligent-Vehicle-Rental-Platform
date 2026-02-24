import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import vehicleReducer from './slices/vehicleSlice';
import userReducer from './slices/userSlice';
import bookingReducer from './slices/bookingSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        vehicles: vehicleReducer,
        users: userReducer,
        bookings: bookingReducer,
        chat: chatReducer,
    },
});
