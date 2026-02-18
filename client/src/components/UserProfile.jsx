import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDetails, reset } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { User, Mail, Phone, FileText, Edit2, Save, X } from 'lucide-react';

const UserProfile = () => {
    const dispatch = useDispatch();
    const { user, isError, isSuccess, message } = useSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.user?.name || '',
        email: user?.user?.email || '',
        phone: user?.user?.phone || '',
        licenseNumber: user?.user?.licenseDetails?.number || '',
        licenseExpiry: user?.user?.licenseDetails?.expiryDate ? new Date(user.user.licenseDetails.expiryDate).toISOString().split('T')[0] : '',
    });

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess && isEditing) {
            toast.success('Profile Updated Successfully');
            setIsEditing(false);
            dispatch(reset()); // Reset state to prevent infinite loop or stale success
        }
    }, [isError, isSuccess, message, isEditing, dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            licenseDetails: {
                number: formData.licenseNumber,
                expiryDate: formData.licenseExpiry
            }
        };
        dispatch(updateDetails(userData));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <User size={24} className="text-blue-600" />
                    My Profile
                </h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Edit2 size={16} />
                        Edit Profile
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <X size={16} />
                        Cancel
                    </button>
                )}
            </div>

            <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 border ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing} // Usually email change requires verification, but keeping enabled for now or disable if preferred
                                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 border ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="+1 (555) 000-0000"
                                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 border ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                                />
                            </div>
                        </div>

                        {/* License Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Driving License Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 border ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                                />
                            </div>
                        </div>

                        {/* License Expiry */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    name="licenseExpiry"
                                    value={formData.licenseExpiry}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 border ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
                            >
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
