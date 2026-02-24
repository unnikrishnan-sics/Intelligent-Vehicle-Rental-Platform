import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatList, fetchMessages, clearMessages } from '../../redux/slices/chatSlice';
import ChatBox from '../../components/Chat/ChatBox';
import './AdminChat.css';

const AdminChat = () => {
    const dispatch = useDispatch();
    const { chatList, loading } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        dispatch(fetchChatList());
    }, [dispatch]);

    const handleSelectUser = (chatUser) => {
        setSelectedUser(chatUser);
        dispatch(clearMessages());
        dispatch(fetchMessages(chatUser._id));
    };

    return (
        <div className="admin-chat-container">
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h2>Messages</h2>
                </div>
                <div className="chat-list">
                    {loading && <p className="p-4 text-center">Loading...</p>}
                    {!loading && chatList.length === 0 && (
                        <p className="p-4 text-center text-gray-400">No active chats</p>
                    )}
                    {chatList.map((chatUser) => (
                        <div
                            key={chatUser._id}
                            className={`chat-item ${selectedUser?._id === chatUser._id ? 'active' : ''}`}
                            onClick={() => handleSelectUser(chatUser)}
                        >
                            <div className="user-avatar">
                                {chatUser.name.charAt(0)}
                            </div>
                            <div className="chat-info">
                                <h4>{chatUser.name}</h4>
                                <p className="last-msg">{chatUser.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="chat-main">
                {selectedUser ? (
                    <ChatBox
                        receiverId={selectedUser._id}
                        receiverName={selectedUser.name}
                        room={selectedUser._id} // Admin joins the room named after customer ID
                    />
                ) : (
                    <div className="empty-chat">
                        <div className="select-prompt">
                            <i className="chat-icon">💬</i>
                            <p>Select a conversation to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
