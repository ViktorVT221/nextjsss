// pages/cart.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../components/ModalMessage';
import { useRouter } from 'next/router';

import styles from '../styles/CartPage.module.css'; 

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [modal, setModal] = useState({ show: false, title: '', message: '' });

  const router = useRouter();

  const closeModal = () => setModal({ show: false, title: '', message: '' });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('http://localhost:5001/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
      setLoading(false);
    } catch (error) {
      setModal({ show: true, title: 'Помилка', message: 'Не вдалося завантажити кошик' });
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5001/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModal({ show: true, title: 'Інформація', message: 'Товар видалено з кошика' });
      fetchCart(); // 🔁 перезавантаження даних кошика
    } catch (error) {
      setModal({ show: true, title: 'Помилка', message: 'Не вдалося видалити товар' });
    }
  };

  const handleCheckout = () => {
    setCheckout(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5001/api/orders/create', {
        deliveryAddress,
        phoneNumber,
        paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setModal({
        show: true,
        title: 'Успіх',
        message: paymentMethod === 'card'
          ? 'Замовлення оформлено, оплата карткою пройшла успішно!'
          : 'Замовлення оформлено, оплатіть готівкою при доставці!'
      });

      setCart({ items: [] }); // ✅ очищення кошика
    } catch (error) {
      setModal({ show: true, title: 'Помилка', message: 'Не вдалося оформити замовлення' });
    }

    setProcessing(false);
    setCheckout(false);
    setDeliveryAddress('');
    setPhoneNumber('');
    setPaymentMethod('card');
  };

  if (loading) return <div className={styles.cartContainer}>Завантаження...</div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <ModalMessage show={modal.show} onClose={closeModal} title={modal.title} message={modal.message} />
        <p>Кошик порожній</p>
      </div>
    );
  }

  const totalSum = cart.items.reduce((sum, item) =>
    sum + item.quantity * (item.product?.price || 0), 0);

  return (
    <div className={styles.cartContainer}>
      <ModalMessage show={modal.show} onClose={closeModal} title={modal.title} message={modal.message} />

      <h2 className={styles.cartTitle}>Мій кошик</h2>

      <div className={styles.cartItemsList}>
        {cart.items.map(item => (
          <div key={item._id} className={styles.cartItem}>
            <div className={styles.cartItemDetails}>
              {item.product?.imagePath ? (
                <img src={`http://localhost:5001/${item.product.imagePath}`} alt={item.product.name} className={styles.cartItemImage} />
              ) : (
                <div className={styles.cartNoImage}>(Немає фото)</div>
              )}
              <div className={styles.cartItemInfo}>
                <p className={styles.itemName}>{item.product?.name}</p>
                <p className={styles.itemPrice}>Ціна: ${item.product?.price}</p>
                <p className={styles.itemQuantity}>Кількість: {item.quantity}</p>
              </div>
            </div>
            <button className={styles.deleteBtn} onClick={() => handleRemove(item.product._id)}>Видалити</button>
          </div>
        ))}
      </div>

      <div className={styles.totalSum}>
        <strong>Загальна сума:</strong> ${totalSum.toFixed(2)}
      </div>

      {!checkout && (
        <button className={styles.checkoutBtn} onClick={handleCheckout}>Оформити замовлення</button>
      )}

      {checkout && (
        <form className={styles.checkoutForm} onSubmit={handleConfirmOrder}>
          <h3>Дані для доставки та оплати</h3>
          <label>Адреса доставки:</label>
          <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} required />

          <label>Номер телефону:</label>
          <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />

          <label>Спосіб оплати:</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="card">Карткою</option>
            <option value="cash">Готівкою</option>
          </select>

          <button type="submit" className={styles.confirmOrderBtn} disabled={processing}>
            {processing ? 'Обробка...' : 'Підтвердити замовлення'}
          </button>
        </form>
      )}
    </div>
  );
}

export default CartPage;