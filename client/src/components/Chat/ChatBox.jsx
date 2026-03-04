import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../redux/slices/chatSlice';
import { io } from 'socket.io-client';
import { Send, User as UserIcon, Headset } from 'lucide-react';
import './ChatBox.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatBox = ({ receiverId, receiverName, room }) => {
    const [message, setMessage] = useState('');
    const { user } = useSelector((state) => state.auth);
    const { messages } = useSelector((state) => state.chat);
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const chatMessagesRef = useRef(null);

    const socketRef = useRef(null);

    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            reconnectionAttempts: 5
        });

        if (room) {
            console.log(`Socket joining room: ${room}`);
            socketRef.current.emit('join_chat', room);
        }

        const handleReceive = (data) => {
            // Only add if it's from someone else to avoid duplicates from optimistic update
            if (data.sender !== user.user.id) {
                dispatch(addMessage(data));
            }
        };

        socketRef.current.on('receive_message', handleReceive);

        return () => {
            if (socketRef.current) {
                socketRef.current.off('receive_message', handleReceive);
                socketRef.current.disconnect();
            }
        };
    }, [room, dispatch, user.user._id]);

    useEffect(() => {
        const scrollToBottom = (behavior = "smooth") => {
            if (chatMessagesRef.current) {
                const { scrollHeight, clientHeight } = chatMessagesRef.current;
                chatMessagesRef.current.scrollTo({
                    top: scrollHeight - clientHeight,
                    behavior
                });
            }
        };

        // Scroll immediately on new messages
        scrollToBottom("auto");

        // And again after a short delay for layout settling (images, etc)
        const timer = setTimeout(() => scrollToBottom("smooth"), 150);
        return () => clearTimeout(timer);
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && socketRef.current && user?.user?.id) {
            const messageData = {
                sender: user.user.id,
                receiver: receiverId,
                message,
                room,
                timestamp: new Date().toISOString()
            };

            console.log(`Socket emitting send_message to room ${room}:`, messageData);
            socketRef.current.emit('send_message', messageData);
            dispatch(addMessage(messageData));
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

            <div className="chat-messages" ref={chatMessagesRef}>
                {messages.length === 0 ? (
                    <div className="empty-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message-wrapper ${msg.sender === user.user.id ? 'sent' : 'received'}`}
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
