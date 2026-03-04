import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, clearMessages } from '../redux/slices/chatSlice';
import { MessageCircle, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import ChatBox from '../components/Chat/ChatBox';
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
                if (data?._id) {
                    dispatch(fetchMessages(data._id));
                }
            } catch (error) {
                console.error("Error fetching admin info:", error);
            }
        };

        if (user && !admin) {
            getAdminInfo();
        }

        return () => {
            // Only clear if we are genuinely leaving the support page
            // dispatch(clearMessages()); 
        };
    }, [user, dispatch, admin]);

    return (
        <div className="support-full-view">
            <div className="support-sidebar-decor">
                <div className="decor-content">
                    <div className="support-badge mb-6">
                        <ShieldCheck size={16} /> Verified Support
                    </div>
                    <h1>Customer <br />Experience</h1>
                    <p>Connect with our experts for instant assistance with your rentals, tracking, or account needs.</p>

                    <div className="features-grid mt-12">
                        <div className="feature-item">
                            <Zap size={20} className="text-blue-500" />
                            <span>Instant Reply</span>
                        </div>
                        <div className="feature-item">
                            <ShieldCheck size={20} className="text-blue-500" />
                            <span>Secure Chat</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="support-chat-main">
                {admin ? (
                    <div className="chat-content-wrapper animate-fadeIn">
                        <ChatBox
                            receiverId={admin._id}
                            receiverName="IntelliDrive Support"
                            room={user.user.id}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full glass-morphism">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Connecting to secure support line...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Support;
