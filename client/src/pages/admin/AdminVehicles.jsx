import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getVehicles, createVehicle, deleteVehicle, updateVehicle, reset } from '../../redux/slices/vehicleSlice';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../AdminDashboard.css';
import ConfirmationModal from '../../components/ConfirmationModal';

// Fix for Leaflet icon not showing
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const AdminVehicles = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { vehicles, isLoading, isError, message } = useSelector(
        (state) => state.vehicles
    );

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Initial position for map (default to New York or 0,0)
    const [mapPosition, setMapPosition] = useState({ lat: 40.7128, lng: -74.0060 });

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        type: 'car',
        licensePlate: '',
        pricePerHour: '',
        description: '',
        imageUrl: '',
        imageFile: null,
    });

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        if (!user || user.user.role !== 'admin') {
            navigate('/login');
        }

        dispatch(getVehicles());

        return () => {
            dispatch(reset());
        };
    }, [user, navigate, isError, message, dispatch]);

    const { make, model, type, licensePlate, pricePerHour, description, imageUrl } = formData;

    const onChange = (e) => {
        if (e.target.name === 'image') {
            setFormData((prevState) => ({
                ...prevState,
                imageFile: e.target.files[0],
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.name]: e.target.value,
            }));
        }
    };

    const openModal = (vehicle = null) => {
        if (vehicle) {
            setIsEditMode(true);
            setCurrentId(vehicle._id);
            setFormData({
                make: vehicle.make,
                model: vehicle.model,
                type: vehicle.type,
                licensePlate: vehicle.licensePlate,
                pricePerHour: vehicle.pricePerHour,
                description: vehicle.description || '',
                imageUrl: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '',
            });
            // Set map position from vehicle data if available, else default
            if (vehicle.currentLocation && vehicle.currentLocation.coordinates) {
                setMapPosition({
                    lat: vehicle.currentLocation.coordinates[1],
                    lng: vehicle.currentLocation.coordinates[0]
                });
            }
        } else {
            setIsEditMode(false);
            setCurrentId(null);
            setFormData({
                make: '',
                model: '',
                type: 'car',
                licensePlate: '',
                pricePerHour: '',
                description: '',
                imageUrl: '',
            });
            setMapPosition({ lat: 40.7128, lng: -74.0060 }); // Reset to default
        }
        setShowModal(true);
    };

    const onSubmit = (e) => {
        e.preventDefault();

        const vehicleData = new FormData();
        vehicleData.append('make', make);
        vehicleData.append('model', model);
        vehicleData.append('type', type);
        vehicleData.append('licensePlate', licensePlate);
        vehicleData.append('pricePerHour', pricePerHour);
        vehicleData.append('description', description);

        // Append location as stringified JSON
        vehicleData.append('currentLocation', JSON.stringify({
            type: 'Point',
            coordinates: [mapPosition.lng, mapPosition.lat]
        }));

        if (formData.imageFile) {
            vehicleData.append('images', formData.imageFile);
        }

        if (isEditMode) {
            dispatch(updateVehicle({ id: currentId, vehicleData }));
            toast.success('Vehicle updated successfully');
        } else {
            dispatch(createVehicle(vehicleData));
            toast.success('Vehicle added successfully');
        }

        setShowModal(false);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = () => {
        dispatch(deleteVehicle(deleteId));
        setShowConfirmModal(false);
        setDeleteId(null);
        toast.success('Vehicle deleted successfully');
    };

    if (isLoading && !showModal) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    return (
        <div className="admin-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Vehicle Management</h1>
                <button
                    onClick={() => openModal()}
                    className="btn-add"
                >
                    <Plus className="mr-2" size={20} />
                    Add Vehicle
                </button>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Vehicle</th>
                            <th>Type</th>
                            <th>License Plate</th>
                            <th>Price/Hr</th>
                            <th>Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((vehicle) => (
                            <tr key={vehicle._id}>
                                <td>
                                    <div className="flex items-center">
                                        {vehicle.images && vehicle.images.length > 0 && (
                                            <img src={vehicle.images[0]} alt="v" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '1rem', objectFit: 'cover' }} />
                                        )}
                                        <div>
                                            <p className="font-bold">{vehicle.make}</p>
                                            <p className="text-gray text-sm">{vehicle.model}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="capitalize">{vehicle.type}</span>
                                </td>
                                <td>
                                    <p>{vehicle.licensePlate}</p>
                                </td>
                                <td>
                                    <p>${vehicle.pricePerHour}</p>
                                </td>
                                <td>
                                    <select
                                        value={vehicle.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            const formData = new FormData();
                                            formData.append('status', newStatus);
                                            dispatch(updateVehicle({ id: vehicle._id, vehicleData: formData }));
                                        }}
                                        className={`status-badge ${vehicle.status === 'available' ? 'status-available' : vehicle.status === 'rented' ? 'status-rented' : 'status-maintenance'}`}
                                        style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                                    >
                                        <option value="available">Available</option>
                                        <option value="rented">Rented</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="cleaning">Cleaning</option>
                                    </select>
                                </td>
                                <td className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => openModal(vehicle)}
                                            className="btn-icon-primary"
                                            title="Edit"
                                            style={{ color: 'var(--primary-color)' }}
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(vehicle._id)}
                                            className="btn-icon-danger"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Vehicle Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="modal-header" style={{ margin: 0 }}>{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                            <button onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={onSubmit}>
                            <div className="flex gap-2">
                                <div className="form-group flex-1">
                                    <label className="form-label text-sm">Make</label>
                                    <input
                                        type="text"
                                        name="make"
                                        value={make}
                                        onChange={onChange}
                                        placeholder="Toyota"
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label text-sm">Model</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={model}
                                        onChange={onChange}
                                        placeholder="Camry"
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="form-group flex-1">
                                    <label className="form-label text-sm">Type</label>
                                    <select
                                        name="type"
                                        value={type}
                                        onChange={onChange}
                                        className="form-control"
                                    >
                                        <option value="car">Car</option>
                                        <option value="bike">Bike</option>
                                        <option value="scooter">Scooter</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label text-sm">Price/Hour</label>
                                    <input
                                        type="number"
                                        name="pricePerHour"
                                        value={pricePerHour}
                                        onChange={onChange}
                                        placeholder="10"
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label text-sm">License Plate</label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={licensePlate}
                                    onChange={onChange}
                                    placeholder="XYZ-1234"
                                    className="form-control"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label text-sm">Vehicle Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={onChange}
                                    className="form-control"
                                    accept="image/*"
                                />
                                {imageUrl && !formData.imageFile && (
                                    <p className="text-xs text-gray-500 mt-1">Current Image: <a href={imageUrl} target="_blank" rel="noreferrer">View</a></p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label text-sm">Vehicle Location (Click on Map)</label>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                                    </MapContainer>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Lat: {mapPosition.lat.toFixed(4)}, Lng: {mapPosition.lng.toFixed(4)}
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label text-sm">Description</label>
                                <textarea
                                    name="description"
                                    value={description}
                                    onChange={onChange}
                                    placeholder="Vehicle description..."
                                    className="form-control"
                                    rows={3}
                                ></textarea>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    {isEditMode ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmDelete}
                title="Delete Vehicle"
                message="Are you sure you want to delete this vehicle? This action cannot be undone."
            />
        </div>
    );
};

export default AdminVehicles;
