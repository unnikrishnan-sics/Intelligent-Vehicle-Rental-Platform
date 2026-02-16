import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllUsers, deleteUser, reset } from '../../redux/slices/userSlice';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
// Consider reusing AdminDashboard.css or creating common admin styles
// For now, let's assume we can use the same table styles
import '../AdminDashboard.css';

const AdminUsers = () => {
    const dispatch = useDispatch();
    const { users, isLoading, isError, message } = useSelector((state) => state.users);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        dispatch(getAllUsers());

        return () => {
            dispatch(reset());
        };
    }, [isError, message, dispatch]);

    if (isLoading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    return (
        <div className="admin-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">User Management</h1>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <p className="font-bold">{user.name}</p>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`status-badge ${user.role === 'admin' ? 'status-rented' : 'status-available'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this user?')) {
                                                dispatch(deleteUser(user._id));
                                            }
                                        }}
                                        className="btn-icon-danger"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
