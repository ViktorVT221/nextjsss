import React, { useState } from 'react';
import axios from 'axios';
import ModalMessage from '../../components/ModalMessage';

function LoginPage() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [modal, setModal] = useState({ show: false, title: '', message: '' });
    const closeModal = () => setModal({ show: false, title: '', message: '' });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/users/login', {
                login,
                password
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role);
            setModal({ show: true, title: 'Успіх', message: 'Вхід успішний!' });
            setTimeout(() => (window.location.href = '/'), 1000);
        } catch (error) {
            setModal({ show: true, title: 'Помилка', message: 'Невірний логін або пароль' });
        }
    };

    return (
        <div className="auth-container fade-in-animation">
            <ModalMessage
                show={modal.show}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
            />
            <h2 className="auth-title">Увійти</h2>
            <form onSubmit={handleLogin} className="auth-form">
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
                <button type="submit" className="auth-button">
                    Увійти
                </button>
            </form>
        </div>
    );
}

export default LoginPage;
