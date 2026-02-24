import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, clearMessages } from '../redux/slices/chatSlice';
import ChatBox from '../components/Chat/ChatBox';
import api from '../utils/api';
import './Contact.css'; // Reuse contact styles or add new ones

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
        <div className="contact-container py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Customer Support</h1>
                    <p className="text-gray-400">Chat with our admin for any queries or issues.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {admin ? (
                        <ChatBox
                            receiverId={admin._id}
                            receiverName={admin.name}
                            room={user.user._id} // Room is always the customer ID
                        />
                    ) : (
                        <div className="text-center text-white">Loading chat...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Support;
