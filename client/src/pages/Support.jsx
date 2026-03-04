import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, clearMessages } from '../redux/slices/chatSlice';
import { MessageCircle, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import api from '../utils/api';
import './Support.css';

const Support = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const getAdminInfo = async () => {
            try {
                const { data } = await api.get('chat/admin');
                setAdmin(data);
                dispatch(fetchMessages(data._id));
            } catch (error) {
                console.error("Error fetching admin info:", error);
            }
        };

        if (user) {
            getAdminInfo();
        }

        return () => {
            dispatch(clearMessages());
        };
    }, [user, dispatch]);

    return (
        <div className="support-page py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="support-hero text-center mb-16">
                    <div className="support-badge mb-4">
                        <ShieldCheck size={16} /> Verified Support
                    </div>
                    <h1 className="text-5xl font-extrabold text-white mb-6">How can we help you?</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Our experts are here to assist you with vehicle bookings, tracking, or account queries.
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-3xl">
                        {admin ? (
                            <div className="chat-wrapper shadow-2xl animate-fadeIn">
                                <ChatBox
                                    receiverId={admin._id}
                                    receiverName="IntelliDrive Support"
                                    room={user.user._id}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 glass-morphism rounded-3xl">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-400">Establishing secure connection...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
