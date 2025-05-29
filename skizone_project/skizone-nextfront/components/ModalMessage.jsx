import React from 'react';
import styles from '../styles/ModalMessage.module.css';

function ModalMessage({ show, onClose, title, message }) {
  if (!show) return null;
  return (
    <div className={styles.modalBackdrop}>
      <div className="modal-window">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose} className={styles.modalCloseBtn}>OK</button>
      </div>
    </div>
  );
}

export default ModalMessage;