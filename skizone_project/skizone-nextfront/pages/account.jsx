// pages/account.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../components/ModalMessage';
import { useRouter } from 'next/router';
import styles from '../styles/AccountPage.module.css'; 

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
      router.push('/');
      return;
    }

    axios.get('http://localhost:5001/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setLogin(res.data.login);
      setLoading(false);
    })
    .catch(() => setLoading(false));

    axios.get('http://localhost:5001/api/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data))
    .catch(() => {});
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5001/api/users/update', {
        login,
        password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

  if (loading) return <div className={styles.accountContainer}>Завантаження...</div>;

  return (
    <div className={styles.accountContainer}>
      <ModalMessage show={modal.show} onClose={closeModal} title={modal.title} message={modal.message} />

      <h2>Мій акаунт</h2>

      <form className={styles.accountForm} onSubmit={handleUpdate}>
        <label>Новий Логін:</label>
        <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} />

        <label>Новий Пароль:</label>
        <input type="password" placeholder="За бажанням" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit" className={styles.updateButton}>Оновити</button>
      </form>

      <button onClick={handleLogout} className={styles.logoutButton}>Вийти</button>

      <hr />

      <h3>Мої замовлення</h3>

      {orders.length === 0 ? (
        <p>Поки немає жодного замовлення</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className={styles.orderItem}>
            <p><strong>ID замовлення:</strong> {order._id}</p>
            <p><strong>Статус:</strong> {order.status}</p>
            <p><strong>Сума:</strong> ${order.totalAmount}</p>
            <p><strong>Дата:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            <div className={styles.orderItems}>
              {order.items.map(item => (
                <div key={item._id} className={styles.orderProduct}>
                  <p>{item.product?.name} (x{item.quantity})</p>
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