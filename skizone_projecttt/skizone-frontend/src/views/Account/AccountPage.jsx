import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../../components/ModalMessage';
import { useRouter } from 'next/router';

function AccountPage() {
    const router = useRouter();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, title: '', message: '' });
    const closeModal = () => setModal({ show: false, title: '', message: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Якщо немає токена, перенаправляємо на головну
            router.push('/');
            return;
        }
        // Завантаження профілю
        axios
            .get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                setLogin(res.data.login);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Завантаження замовлень
        axios
            .get('http://localhost:5000/api/orders/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                setOrders(res.data);
            })
            .catch(() => {
                // помилку можна проігнорувати або показати
            });
    }, [router]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                'http://localhost:5000/api/users/update',
                {
                    login,
                    password
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setModal({ show: true, title: 'Успіх', message: 'Дані оновлено' });
            setPassword('');
        } catch (error) {
            setModal({ show: true, title: 'Помилка', message: 'Не вдалося оновити дані' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.push('/');
    };

    if (loading) return <div className="account-container">Завантаження...</div>;

    return (
        <div className="account-container">
            <ModalMessage
                show={modal.show}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
            />

            <h2>Мій акаунт</h2>
            <form className="account-form" onSubmit={handleUpdate}>
                <label>Новий Логін:</label>
                <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} />
                <label>Новий Пароль:</label>
                <input
                    type="password"
                    placeholder="За бажанням"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="update-button">
                    Оновити
                </button>
            </form>

            <button onClick={handleLogout} className="logout-button">
                Вийти
            </button>

            <hr />

            <h3>Мої замовлення</h3>
            {orders.length === 0 ? (
                <p>Поки немає жодного замовлення</p>
            ) : (
                orders.map((order) => (
                    <div key={order._id} className="order-item">
                        <p>
                            <strong>ID замовлення:</strong> {order._id}
                        </p>
                        <p>
                            <strong>Статус:</strong> {order.status}
                        </p>
                        <p>
                            <strong>Сума:</strong> ${order.totalAmount}
                        </p>
                        <p>
                            <strong>Дата:</strong> {new Date(order.createdAt).toLocaleString()}
                        </p>

                        {/* Виводимо, що саме було замовлено */}
                        <div className="order-items">
                            {order.items.map((item) => (
                                <div key={item._id} className="order-product">
                                    <p>
                                        {item.product?.name} (x{item.quantity})
                                    </p>
                                </div>
                            ))}
                        </div>
                        <hr />
                    </div>
                ))
            )}
        </div>
    );
}

export default AccountPage;
