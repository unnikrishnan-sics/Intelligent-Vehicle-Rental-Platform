import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../redux/slices/chatSlice';
import { io } from 'socket.io-client';
import './ChatBox.css';

const socket = io('http://localhost:5000');

const ChatBox = ({ receiverId, receiverName, room }) => {
    const [message, setMessage] = useState('');
    const { user } = useSelector((state) => state.auth);
    const { messages } = useSelector((state) => state.chat);
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (room) {
            socket.emit('join_chat', room);
        }

        socket.on('receive_message', (data) => {
            dispatch(addMessage(data));
        });

        return () => {
            socket.off('receive_message');
        };
    }, [room, dispatch]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            const messageData = {
                sender: user.user._id,
                receiver: receiverId,
                message,
                room
            };

            socket.emit('send_message', messageData);
            setMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Chat with {receiverName}</h3>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message-bubble ${msg.sender === user.user._id ? 'sent' : 'received'}`}
                    >
                        <p>{msg.message}</p>
                        <span className="timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatBox;
