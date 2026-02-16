import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Create new booking
export const createBooking = createAsyncThunk(
    'bookings/create',
    async (bookingData, thunkAPI) => {
        try {
            const response = await api.post('bookings', bookingData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get user bookings
export const getMyBookings = createAsyncThunk(
    'bookings/getMyBookings',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('bookings/mybookings');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Admin: Get all bookings
export const getAllBookings = createAsyncThunk(
    'bookings/getAllBookings',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('bookings');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Admin: Update booking status
export const updateBookingStatus = createAsyncThunk(
    'bookings/updateStatus',
    async ({ id, status }, thunkAPI) => {
        try {
            const response = await api.put('bookings/' + id + '/status', { status });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const initialState = {
    bookings: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createBooking.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.bookings.push(action.payload);
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getMyBookings.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMyBookings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.bookings = action.payload;
            })
            .addCase(getMyBookings.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAllBookings.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllBookings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.bookings = action.payload;
            })
            .addCase(getAllBookings.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.bookings.findIndex(booking => booking._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
            });
    },
});

export const { reset } = bookingSlice.actions;
export default bookingSlice.reducer;
