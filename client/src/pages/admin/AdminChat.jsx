import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, User as UserIcon, MessageSquare, Clock } from 'lucide-react';
import './AdminChat.css';

const AdminChat = () => {
    const dispatch = useDispatch();
    const { chatList, loading } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const [selectedUser, setSelectedUser] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchChatList());
    }, [dispatch]);

    const handleSelectUser = (chatUser) => {
        setSelectedUser(chatUser);
        dispatch(clearMessages());
        dispatch(fetchMessages(chatUser._id));
    };

    const filteredChats = chatList.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-chat-view">
            <div className="admin-chat-container glass-morphism">
                <div className="chat-sidebar">
                    <div className="sidebar-header">
                        <div className="flex justify-between items-center mb-6">
                            <h2>Messages</h2>
                            <div className="badge-count">{chatList.length}</div>
                        </div>
                        <div className="search-bar">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="chat-list">
                        {loading && (
                            <div className="flex flex-col items-center justify-center p-10">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <p className="text-sm text-gray-400">Loading chats...</p>
                            </div>
                        )}

                        {!loading && filteredChats.length === 0 && (
                            <div className="text-center p-10 text-gray-500">
                                <p>{searchTerm ? 'No users match your search' : 'No active conversations'}</p>
                            </div>
                        )}

                        {filteredChats.map((chatUser) => (
                            <div
                                key={chatUser._id}
                                className={`chat-item ${selectedUser?._id === chatUser._id ? 'active' : ''}`}
                                onClick={() => handleSelectUser(chatUser)}
                            >
                                <div className="user-avatar-wrapper">
                                    <div className="user-avatar">
                                        {chatUser.name.charAt(0)}
                                    </div>
                                    <span className="online-indicator"></span>
                                </div>
                                <div className="chat-info">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4>{chatUser.name}</h4>
                                        <span className="time-ago">now</span>
                                    </div>
                                    <p className="last-msg">{chatUser.lastMessage || 'Start conversation...'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chat-main">
                    {selectedUser ? (
                        <div className="chat-interface animate-fadeIn">
                            <ChatBox
                                receiverId={selectedUser._id}
                                receiverName={selectedUser.name}
                                room={selectedUser._id}
                            />
                        </div>
                    ) : (
                        <div className="empty-chat">
                            <div className="select-prompt">
                                <div className="prompt-icon">
                                    <MessageSquare size={48} />
                                </div>
                                <h2>Your Inbox</h2>
                                <p>Select a customer from the left to view the conversation and start replying.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
