import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getVehicles, reset } from '../redux/slices/vehicleSlice';
import BookingModal from '../components/BookingModal';
import './VehicleList.css';

const VehicleList = () => {
    const dispatch = useDispatch();
    const location = useLocation(); // Hook to get query params
    const { vehicles, isLoading, isError, message } = useSelector(
        (state) => state.vehicles
    );

    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        if (isError) {
            console.log(message);
        }

        // Parse query params
        const searchParams = new URLSearchParams(location.search);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        // Dispatch with params if they exist
        dispatch(getVehicles({ lat, lng }));

        return () => {
            dispatch(reset());
        };
    }, [isError, message, dispatch, location.search]);

    if (isLoading) {
        return <div className="text-center mt-20">Loading vehicles...</div>;
    }

    return (
        <div className="vehicle-list-container">
            <h1 className="page-title text-center my-8">
                {new URLSearchParams(location.search).get('lat')
                    ? 'Available Vehicles Near You'
                    : 'Our Premium Fleet'}
            </h1>

            <div className="container">
                {vehicles.length === 0 ? (
                    <p className="text-center text-gray-500 text-xl">No vehicles found matching your criteria.</p>
                ) : (
                    <div className="vehicles-grid">
                        {vehicles.map((vehicle) => (
                            <div key={vehicle._id} className="vehicle-card">
                                <img
                                    src={vehicle.images[0] || 'https://via.placeholder.com/300x200'}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    className="vehicle-image"
                                />
                                <div className="vehicle-details">
                                    <h3 className="vehicle-title">
                                        {vehicle.make} {vehicle.model}
                                    </h3>
                                    <p className="vehicle-type capitalize">{vehicle.type}</p>
                                    <p className="vehicle-price">
                                        <span className="price">${vehicle.pricePerHour}</span>/hour
                                    </p>
                                    {vehicle.isAvailable === false && (
                                        <p className="text-red-500 text-xs mb-2 font-medium">
                                            Currently Rented. Available from: {new Date(vehicle.nextAvailableDate).toLocaleDateString()}
                                        </p>
                                    )}
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={() => setSelectedVehicle(vehicle)}
                                    >
                                        {vehicle.isAvailable === false ? 'Pre-Book for Later' : 'Book Now'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {selectedVehicle && (
                <BookingModal
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                />
            )}
        </div>
    );
};

export default VehicleList;
