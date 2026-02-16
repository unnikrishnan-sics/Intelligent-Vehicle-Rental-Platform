import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleService from '../../services/vehicleService';

const initialState = {
    vehicles: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Get all vehicles
export const getVehicles = createAsyncThunk(
    'vehicles/getAll',
    async (params, thunkAPI) => {
        try {
            // Check if params is an object
            const { lat, lng } = params || {};
            let queryString = '';
            if (lat && lng) {
                queryString = `?lat=${lat}&lng=${lng}`;
            }
            return await vehicleService.getVehicles(queryString);
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create new vehicle
export const createVehicle = createAsyncThunk(
    'vehicles/create',
    async (vehicleData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            return await vehicleService.createVehicle(vehicleData, token);
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update vehicle
export const updateVehicle = createAsyncThunk(
    'vehicles/update',
    async ({ id, vehicleData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            return await vehicleService.updateVehicle(id, vehicleData, token);
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete vehicle
export const deleteVehicle = createAsyncThunk(
    'vehicles/delete',
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            await vehicleService.deleteVehicle(id, token);
            return id;
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const vehicleSlice = createSlice({
    name: 'vehicle',
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
            .addCase(getVehicles.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getVehicles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.vehicles = action.payload;
            })
            .addCase(getVehicles.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createVehicle.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createVehicle.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.vehicles.push(action.payload);
            })
            .addCase(createVehicle.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateVehicle.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateVehicle.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.vehicles.findIndex(v => v._id === action.payload._id);
                if (index !== -1) {
                    state.vehicles[index] = action.payload;
                }
            })
            .addCase(updateVehicle.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteVehicle.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteVehicle.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.vehicles = state.vehicles.filter(
                    (vehicle) => vehicle._id !== action.payload
                );
            })
            .addCase(deleteVehicle.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = vehicleSlice.actions;
export default vehicleSlice.reducer;
