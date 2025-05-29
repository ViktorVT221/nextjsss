// pages/register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import ModalMessage from '../components/ModalMessage';
import { useRouter } from 'next/router';

import styles from '../styles/AuthForms.module.css'; 

function RegisterPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState({ show: false, title: '', message: '' });
  const router = useRouter();

  const closeModal = () => setModal({ show: false, title: '', message: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/users/register', { login, password });
      setModal({
        show: true,
        title: 'Успіх',
        message: `Реєстрація успішна! Тепер увійдіть з логіном: ${login}`
      });

      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      setModal({
        show: true,
        title: 'Помилка',
        message: 'Не вдалося зареєструватися'
      });
    }
  };

  return (
    <div className={`${styles.authContainer} ${styles.fadeInAnimation}`}>
      <ModalMessage show={modal.show} onClose={closeModal} title={modal.title} message={modal.message} />
      <h2 className={styles.authTitle}>Реєстрація</h2>
      <form onSubmit={handleRegister} className={styles.authForm}>
        <label>Логін</label>
        <input
          type="text"
          placeholder="Введіть логін"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <label>Пароль</label>
        <input
          type="password"
          placeholder="Введіть пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.authButton}>Зареєструватися</button>
      </form>
    </div>
  );
}

export default RegisterPage;