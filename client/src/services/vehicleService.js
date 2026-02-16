import api from '../utils/api';

// Get all vehicles
const getVehicles = async (queryString = '') => {
    const response = await api.get('vehicles' + queryString);
    return response.data;
};

// Create new vehicle
const createVehicle = async (vehicleData) => {
    const response = await api.post('vehicles', vehicleData);
    return response.data;
};

// Update vehicle
const updateVehicle = async (id, vehicleData) => {
    const response = await api.put('vehicles/' + id, vehicleData);
    return response.data;
};

// Delete vehicle
const deleteVehicle = async (id) => {
    const response = await api.delete('vehicles/' + id);
    return response.data;
};

const vehicleService = {
    getVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
};

export default vehicleService;
