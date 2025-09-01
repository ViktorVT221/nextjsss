import React from 'react';

function ModalMessage({ show, onClose, title, message }) {
    if (!show) return null;
    return (
        <div className="modal-backdrop">
            <div className="modal-window">
                <h2>{title}</h2>
                <p>{message}</p>
                <button onClick={onClose} className="modal-close-btn">
                    OK
                </button>
            </div>
        </div>
    );
}

export default ModalMessage;
