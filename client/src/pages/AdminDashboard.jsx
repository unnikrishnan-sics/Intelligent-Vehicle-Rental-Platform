import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getVehicles, createVehicle, deleteVehicle, updateVehicle, reset } from '../redux/slices/vehicleSlice';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { vehicles, isLoading, isError, message } = useSelector(
        (state) => state.vehicles
    );

    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        type: 'car',
        licensePlate: '',
        pricePerHour: '',
        description: '',
        imageUrl: '',
        lat: '0',
        lng: '0'
    });

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

    const { make, model, type, licensePlate, pricePerHour, description, imageUrl, lat, lng } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
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
                lat: vehicle.currentLocation?.coordinates[1] || '0',
                lng: vehicle.currentLocation?.coordinates[0] || '0'
            });
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
                lat: '0',
                lng: '0'
            });
        }
        setShowModal(true);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const vehicleData = {
            make,
            model,
            type,
            licensePlate,
            pricePerHour,
            description,
            images: imageUrl ? [imageUrl] : [],
            currentLocation: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            }
        };

        if (isEditMode) {
            dispatch(updateVehicle({ id: currentId, vehicleData }));
            toast.success('Vehicle updated successfully');
        } else {
            dispatch(createVehicle(vehicleData));
            toast.success('Vehicle added successfully');
        }

        setShowModal(false);
    };

    const onDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            dispatch(deleteVehicle(id));
        }
    };

    if (isLoading && !showModal) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    return (
        <div className="container admin-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Admin Dashboard</h1>
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
                                    <span className={`status-badge ${vehicle.status === 'available' ? 'status-available' : 'status-rented'}`}>
                                        {vehicle.status}
                                    </span>
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
                                            onClick={() => onDelete(vehicle._id)}
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
                    <div className="modal-content">
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
                                <label className="form-label text-sm">Image URL</label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={imageUrl}
                                    onChange={onChange}
                                    placeholder="https://example.com/car.jpg"
                                    className="form-control"
                                />
                            </div>

                            <div className="flex gap-2">
                                <div className="form-group flex-1">
                                    <label className="form-label text-sm">Latitude</label>
                                    <input
                                        type="text"
                                        name="lat"
                                        value={lat}
                                        onChange={onChange}
                                        placeholder="0.00"
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label text-sm">Longitude</label>
                                    <input
                                        type="text"
                                        name="lng"
                                        value={lng}
                                        onChange={onChange}
                                        placeholder="0.00"
                                        className="form-control"
                                    />
                                </div>
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
        </div>
    );
};

export default AdminDashboard;
