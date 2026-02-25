import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDetails, reset } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import {
    Grid, Paper, Typography, TextField, Button, Avatar, Box, Chip,
    IconButton
} from '@mui/material';
import {
    Edit as EditIcon, Save as SaveIcon, Close as CloseIcon,
    Person, Email, Phone, Description, Event, VerifiedUser,
    CloudUpload, Delete as DeleteIcon
} from '@mui/icons-material';

const UserProfile = () => {
    const dispatch = useDispatch();
    const { user, isError, isSuccess, message } = useSelector((state) => state.auth);
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [licenseImage, setLicenseImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: user?.user?.name || '',
        email: user?.user?.email || '',
        phone: user?.user?.phone || '',
        licenseNumber: user?.user?.licenseDetails?.number || '',
        licenseExpiry: user?.user?.licenseDetails?.expiryDate ? new Date(user.user.licenseDetails.expiryDate).toISOString().split('T')[0] : '',
    });

    useEffect(() => {
        if (user?.user) {
            setFormData({
                name: user.user.name || '',
                email: user.user.email || '',
                phone: user.user.phone || '',
                licenseNumber: user.user.licenseDetails?.number || '',
                licenseExpiry: user.user.licenseDetails?.expiryDate ? new Date(user.user.licenseDetails.expiryDate).toISOString().split('T')[0] : '',
            });

            if (user.user.licenseDetails?.image) {
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                setImagePreview(`${baseUrl}${user.user.licenseDetails.image}`);
            }
        }
    }, [user]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess && isEditing) {
            toast.success('Profile Updated Successfully');
            setIsEditing(false);
            setLicenseImage(null);
            setErrors({});
            dispatch(reset());
        }
    }, [isError, isSuccess, message, isEditing, dispatch]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'phone') {
            // Filter non-numeric and limit to 10 digits
            value = value.replace(/[^0-9]/g, '').slice(0, 10);
        }
        setFormData({ ...formData, [name]: value });
        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                toast.error('File size too large (max 5MB)');
                return;
            }
            setLicenseImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email Address is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email Address is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('licenseDetails', JSON.stringify({
            number: formData.licenseNumber,
            expiryDate: formData.licenseExpiry
        }));

        if (licenseImage) {
            data.append('licenseImage', licenseImage);
        }

        dispatch(updateDetails(data));
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <Grid container spacing={4}>
            {/* Left Column: Profile Card */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', position: 'sticky', top: 100 }}>
                    <Box sx={{ height: 120, background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -6, pb: 4, px: 3 }}>
                        <Avatar
                            sx={{ width: 100, height: 100, border: '4px solid white', fontSize: '2.5rem', bgcolor: '#e0e7ff', color: '#4f46e5' }}
                        >
                            {user?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>

                        <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
                            {user?.user?.name || 'User Name'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user?.user?.email || 'email@example.com'}
                        </Typography>

                        <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                            <Chip
                                icon={<VerifiedUser fontSize="small" />}
                                label="Verified"
                                color="primary"
                                size="small"
                                variant="outlined"
                            />
                            <Chip
                                icon={<Person fontSize="small" />}
                                label="Member"
                                color="success"
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* Right Column: Details Form */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ p: 4, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fafafa' }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
                            <Typography variant="body2" color="text.secondary">Manage your personal details and license information.</Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={isEditing ? <CloseIcon /> : <EditIcon />}
                            color={isEditing ? 'error' : 'primary'}
                            onClick={() => {
                                setIsEditing(!isEditing);
                                setErrors({});
                                if (isEditing) {
                                    setLicenseImage(null);
                                    if (user?.user?.licenseDetails?.image) {
                                        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                                        setImagePreview(`${baseUrl}${user.user.licenseDetails.image}`);
                                    } else {
                                        setImagePreview(null);
                                    }
                                }
                            }}
                            sx={{ borderRadius: 2 }}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </Button>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    InputProps={{
                                        startAdornment: <Person color="action" sx={{ mr: 1 }} />,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    InputProps={{
                                        startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    InputProps={{
                                        startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Driving License"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    InputProps={{
                                        startAdornment: <Description color="action" sx={{ mr: 1 }} />,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="License Expiry"
                                    name="licenseExpiry"
                                    type="date"
                                    value={formData.licenseExpiry}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    InputProps={{
                                        startAdornment: <Event color="action" sx={{ mr: 1 }} />,
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1,
                                    height: '100%',
                                    justifyContent: 'center',
                                    bgcolor: isEditing ? 'action.hover' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />

                                    {imagePreview ? (
                                        <Box sx={{ position: 'relative', width: '100%', maxWidth: 200 }}>
                                            <img
                                                src={imagePreview}
                                                alt="License Preview"
                                                style={{ width: '100%', borderRadius: 8, maxHeight: 100, objectFit: 'cover' }}
                                            />
                                            {isEditing && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setLicenseImage(null);
                                                        setImagePreview(null);
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -10,
                                                        right: -10,
                                                        bgcolor: 'error.main',
                                                        color: 'white',
                                                        '&:hover': { bgcolor: 'error.dark' }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <CloudUpload color="action" sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                No license document
                                            </Typography>
                                        </Box>
                                    )}

                                    {isEditing && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={triggerFileInput}
                                            startIcon={<CloudUpload />}
                                            sx={{ mt: 1 }}
                                        >
                                            {imagePreview ? 'Change' : 'Upload'}
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>

                        {isEditing && (
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<SaveIcon />}
                                    sx={{ borderRadius: 2, px: 4, background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default UserProfile;
