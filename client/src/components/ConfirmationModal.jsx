import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import '../pages/admin/AdminDashboard.css'; // Reusing admin styles for consistency

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="modal-header flex items-center gap-2" style={{ margin: 0, color: '#dc2626' }}>
                        <AlertTriangle size={24} />
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600">{message}</p>
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="btn btn-primary"
                        style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
