import React, { useState } from 'react';
import axios from 'axios';
import ModalMessage from '../../components/ModalMessage';

function RegisterPage() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [modal, setModal] = useState({ show: false, title: '', message: '' });
    const closeModal = () => setModal({ show: false, title: '', message: '' });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/users/register', { login, password });
            setModal({
                show: true,
                title: 'Успіх',
                message: `Реєстрація успішна! Тепер увійдіть з логіном: ${login}`
            });
        } catch (error) {
            setModal({ show: true, title: 'Помилка', message: 'Не вдалося зареєструватися' });
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
            <h2 className="auth-title">Реєстрація</h2>
            <form onSubmit={handleRegister} className="auth-form">
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
                    Зареєструватися
                </button>
            </form>
        </div>
    );
}

export default RegisterPage;
