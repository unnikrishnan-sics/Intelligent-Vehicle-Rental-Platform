import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../redux/slices/chatSlice';
import { io } from 'socket.io-client';
import { Send, User as UserIcon, Headset } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatBox = ({ receiverId, receiverName, room }) => {
    const [message, setMessage] = useState('');
    const { user } = useSelector((state) => state.auth);
    const { messages } = useSelector((state) => state.chat);
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);

    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io(SOCKET_URL);

        if (room) {
            socketRef.current.emit('join_chat', room);
        }

        socketRef.current.on('receive_message', (data) => {
            dispatch(addMessage(data));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.off('receive_message');
                socketRef.current.disconnect();
            }
        };
    }, [room, dispatch]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && socketRef.current) {
            const messageData = {
                sender: user.user._id,
                receiver: receiverId,
                message,
                room,
                timestamp: new Date().toISOString()
            };

            socketRef.current.emit('send_message', messageData);
            // Optimistically add to local state if needed? 
            // Better to let the server broadcast it back or handle it via receive_message
            setMessage('');
        }
    };

    return (
        <div className="chat-container glass-morphism">
            <div className="chat-header">
                <div className="header-info">
                    <div className="header-avatar">
                        {receiverName === 'Admin' ? <Headset size={20} /> : <UserIcon size={20} />}
                    </div>
                    <div>
                        <h3>{receiverName}</h3>
                        <span className="status-online">Online</span>
                    </div>
                </div>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message-wrapper ${msg.sender === user.user._id ? 'sent' : 'received'}`}
                        >
                            <div className="message-bubble">
                                <p>{msg.message}</p>
                                <span className="timestamp">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Write a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="send-btn" disabled={!message.trim()}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
