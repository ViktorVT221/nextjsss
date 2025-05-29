// pages/order.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../components/ModalMessage';
import styles from '../styles/OrderPage.module.css'; 

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, title: '', message: '' });
  const closeModal = () => setModal({ show: false, title: '', message: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    axios.get('http://localhost:5001/api/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setOrders(res.data);
      setLoading(false);
    }).catch(err => {
      setModal({ show: true, title: 'Помилка', message: 'Не вдалося завантажити замовлення' });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className={styles.orderContainer}>Завантаження...</div>;

  return (
    <div className={styles.orderContainer}>
      <ModalMessage show={modal.show} onClose={closeModal} title={modal.title} message={modal.message} />
      <h2>Мої замовлення</h2>
      {orders.length === 0 ? (
        <p>Замовлень немає</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className={styles.orderItem}>
            <p><strong>Замовлення №:</strong> {order._id}</p>
            <p><strong>Статус:</strong> {order.status}</p>
            <p><strong>Сума:</strong> ${order.totalAmount.toFixed(2)}</p>
            <p><strong>Дата:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderPage;