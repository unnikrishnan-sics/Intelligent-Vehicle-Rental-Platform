import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, clearMessages } from '../redux/slices/chatSlice';
import { MessageCircle, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Contact Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="support-card animate-fadeIn">
                            <div className="card-icon bg-blue-500/20 text-blue-400">
                                <Zap size={24} />
                            </div>
                            <h3>Instant Chat</h3>
                            <p>Average response time: &lt; 2 minutes</p>
                        </div>

                        <div className="support-card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                            <div className="card-icon bg-purple-500/20 text-purple-400">
                                <HelpCircle size={24} />
                            </div>
                            <h3>FAQ Portal</h3>
                            <p>Find quick answers in our knowledge base.</p>
                        </div>

                        <div className="support-card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                            <div className="card-icon bg-green-500/20 text-green-400">
                                <MessageCircle size={24} />
                            </div>
                            <h3>24/7 Availability</h3>
                            <p>We're here for you anytime, day or night.</p>
                        </div>
                    </div>

                    {/* Chat Section */}
                    <div className="lg:col-span-2">
                        {admin ? (
                            <div className="chat-wrapper shadow-2xl">
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
