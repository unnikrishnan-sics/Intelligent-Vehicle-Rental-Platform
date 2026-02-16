import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBookings, updateBookingStatus } from '../../redux/slices/bookingSlice';
import { Check, X, Clock, Play, Archive } from 'lucide-react';
import { toast } from 'react-toastify';
import '../AdminDashboard.css';

const AdminBookings = () => {
    const dispatch = useDispatch();
    const { bookings, isLoading, isError, message } = useSelector((state) => state.bookings);

    useEffect(() => {
        dispatch(getAllBookings());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
    }, [isError, message]);

    const handleStatusUpdate = (id, status) => {
        if (window.confirm(`Are you sure you want to mark this booking as ${status}?`)) {
            dispatch(updateBookingStatus({ id, status }))
                .unwrap()
                .then(() => toast.success(`Booking marked as ${status}`))
                .catch((err) => toast.error(err));
        }
    };

    const getStatusBadge = (status) => {
        const statusClass = `status-badge status-${status.toLowerCase()}`;
        return <span className={statusClass}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    };

    if (isLoading) return <div className="text-center p-10">Loading Bookings...</div>;

    return (
        <div className="admin-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Booking Management</h1>
                <p style={{ color: '#6b7280' }}>View and manage all customer reservations</p>
            </div>

            <div className="table-container">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>User</th>
                                <th>Dates</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>
                                        <div className="vehicle-cell">
                                            <img
                                                className="booking-vehicle-img"
                                                src={booking.vehicle?.images[0]}
                                                alt=""
                                            />
                                            <div className="vehicle-info">
                                                <h4>{booking.vehicle?.make} {booking.vehicle?.model}</h4>
                                                <p>{booking.vehicle?.licensePlate}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            <div style={{ fontWeight: 500 }}>{booking.user?.name}</div>
                                            <div style={{ color: '#6b7280' }}>{booking.user?.email}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.75rem' }}>to {new Date(booking.endDate).toLocaleDateString()}</div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>
                                        ${booking.totalPrice}
                                    </td>
                                    <td>
                                        {getStatusBadge(booking.status)}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking._id, 'active')}
                                                    className="action-btn btn-start"
                                                    title="Start Rental"
                                                >
                                                    <Play size={16} />
                                                </button>
                                            )}
                                            {booking.status === 'active' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                    className="action-btn btn-complete"
                                                    title="Complete Rental"
                                                >
                                                    <Archive size={16} />
                                                </button>
                                            )}
                                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                    className="action-btn btn-cancel"
                                                    title="Cancel Booking"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bookings.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No bookings found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
