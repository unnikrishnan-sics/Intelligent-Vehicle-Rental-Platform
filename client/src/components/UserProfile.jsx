import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDetails, reset } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import {
    Grid, Paper, Typography, TextField, Button, Avatar, Box, Chip
} from '@mui/material';
import {
    Edit as EditIcon, Save as SaveIcon, Close as CloseIcon,
    Person, Email, Phone, Description, Event, VerifiedUser
} from '@mui/icons-material';

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
        if (user?.user) {
            setFormData({
                name: user.user.name || '',
                email: user.user.email || '',
                phone: user.user.phone || '',
                licenseNumber: user.user.licenseDetails?.number || '',
                licenseExpiry: user.user.licenseDetails?.expiryDate ? new Date(user.user.licenseDetails.expiryDate).toISOString().split('T')[0] : '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess && isEditing) {
            toast.success('Profile Updated Successfully');
            setIsEditing(false);
            dispatch(reset());
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
        <Grid container spacing={4}>
            {/* Left Column: Profile Card */}
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={8}>
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
                            onClick={() => setIsEditing(!isEditing)}
                            sx={{ borderRadius: 2 }}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </Button>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    InputProps={{
                                        startAdornment: <Person color="action" sx={{ mr: 1 }} />,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    InputProps={{
                                        startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
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
                            <Grid item xs={12} md={6}>
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
                            <Grid item xs={12} md={6}>
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
