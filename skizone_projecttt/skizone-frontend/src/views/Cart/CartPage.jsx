import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../../components/ModalMessage';

function CartPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkout, setCheckout] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [processing, setProcessing] = useState(false);
    const [modal, setModal] = useState({ show: false, title: '', message: '' });
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [errors, setErrors] = useState({});
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
            const res = await axios.get('http://localhost:5000/api/cart', {
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
            await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModal({ show: true, title: 'Інформація', message: 'Товар видалено з кошика' });
            fetchCart();
        } catch (error) {
            setModal({ show: true, title: 'Помилка', message: 'Не вдалося видалити товар' });
        }
    };

    const handleCheckout = () => {
        setCheckout(true);
    };

    const validateCardDetails = () => {
        const newErrors = {};

        // Validate card number (16 digits)
        if (paymentMethod === 'card') {
            const cardNumberClean = cardNumber.replace(/\s/g, '');
            if (!/^\d{16}$/.test(cardNumberClean)) {
                newErrors.cardNumber = 'Номер карти повинен містити 16 цифр';
            }

            // Validate expiry date (MM/YY format)
            if (!/^(0[1-9]|1[0-2])\/([2-9]\d)$/.test(cardExpiry)) {
                newErrors.cardExpiry = 'Невірний формат дати (MM/YY)';
            } else {
                const [month, year] = cardExpiry.split('/');
                const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
                if (expiry < new Date()) {
                    newErrors.cardExpiry = 'Термін дії карти минув';
                }
            }

            // Validate CVV (3 digits)
            if (!/^\d{3}$/.test(cardCVV)) {
                newErrors.cardCVV = 'CVV повинен містити 3 цифри';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        // Add space after every 4 digits
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        // Limit to 19 characters (16 digits + 3 spaces)
        value = value.substring(0, 19);
        setCardNumber(value);
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        setCardExpiry(value);
    };

    const handleConfirmOrder = async (e) => {
        e.preventDefault();

        if (paymentMethod === 'card' && !validateCardDetails()) {
            return;
        }

        setProcessing(true);
        setTimeout(async () => {
            const token = localStorage.getItem('token');
            try {
                await axios.post(
                    'http://localhost:5000/api/orders/create',
                    {
                        deliveryAddress,
                        phoneNumber,
                        paymentMethod,
                        cardDetails:
                            paymentMethod === 'card'
                                ? {
                                      number: cardNumber.replace(/\s/g, ''),
                                      expiry: cardExpiry,
                                      cvv: cardCVV
                                  }
                                : null
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setModal({
                    show: true,
                    title: 'Успіх',
                    message:
                        paymentMethod === 'card'
                            ? 'Замовлення оформлено, оплата карткою пройшла успішно!'
                            : 'Замовлення оформлено, оплатіть готівкою при доставці!'
                });
                setCart({ items: [] });
            } catch (error) {
                setModal({
                    show: true,
                    title: 'Помилка',
                    message: 'Не вдалося оформити замовлення'
                });
            }
            setProcessing(false);
            setCheckout(false);
            setDeliveryAddress('');
            setPhoneNumber('');
            setPaymentMethod('card');
            setCardNumber('');
            setCardExpiry('');
            setCardCVV('');
        }, 3000);
    };

    if (loading) return <div className="cart-container">Завантаження...</div>;
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="cart-container">
                <ModalMessage
                    show={modal.show}
                    onClose={closeModal}
                    title={modal.title}
                    message={modal.message}
                />
                <p>Кошик порожній</p>
            </div>
        );
    }

    const totalSum = cart.items.reduce(
        (sum, item) => sum + item.quantity * (item.product?.price || 0),
        0
    );

    return (
        <div className="cart-container">
            <ModalMessage
                show={modal.show}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
            />
            <h2 className="cart-title">Мій кошик</h2>
            <div className="cart-items-list">
                {cart.items.map((item) => (
                    <div key={item._id} className="cart-item">
                        <div className="cart-item-details">
                            {item.product?.imagePath ? (
                                <img
                                    src={`http://localhost:5000/${item.product.imagePath}`}
                                    alt={item.product.name}
                                    className="cart-item-image"
                                />
                            ) : (
                                <div className="cart-no-image">(Немає фото)</div>
                            )}
                            <div className="cart-item-info">
                                <p className="item-name">{item.product?.name}</p>
                                <p className="item-price">Ціна: ${item.product?.price}</p>
                                <p className="item-quantity">Кількість: {item.quantity}</p>
                            </div>
                        </div>
                        <button
                            className="delete-btn"
                            onClick={() => handleRemove(item.product._id)}
                        >
                            Видалити
                        </button>
                    </div>
                ))}
            </div>
            <div className="total-sum">
                <strong>Загальна сума:</strong> ${totalSum.toFixed(2)}
            </div>
            {!checkout && (
                <button className="checkout-btn" onClick={handleCheckout}>
                    Оформити замовлення
                </button>
            )}
            {checkout && (
                <form className="checkout-form" onSubmit={handleConfirmOrder}>
                    <h3>Дані для доставки та оплати</h3>
                    <label>Адреса доставки:</label>
                    <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                    />
                    <label>Номер телефону:</label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                    <label>Спосіб оплати:</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="card">Карткою</option>
                        <option value="cash">Готівкою</option>
                    </select>

                    {paymentMethod === 'card' && (
                        <div className="card-details">
                            <label>Номер карти:</label>
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                                required
                            />
                            {errors.cardNumber && (
                                <span className="error">{errors.cardNumber}</span>
                            )}

                            <label>Термін дії (MM/YY):</label>
                            <input
                                type="text"
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                placeholder="MM/YY"
                                maxLength="5"
                                required
                            />
                            {errors.cardExpiry && (
                                <span className="error">{errors.cardExpiry}</span>
                            )}

                            <label>CVV:</label>
                            <input
                                type="password"
                                value={cardCVV}
                                onChange={(e) =>
                                    setCardCVV(e.target.value.replace(/\D/g, '').substring(0, 3))
                                }
                                placeholder="123"
                                maxLength="3"
                                required
                            />
                            {errors.cardCVV && <span className="error">{errors.cardCVV}</span>}
                        </div>
                    )}

                    <button type="submit" className="confirm-order-btn" disabled={processing}>
                        {processing ? 'Обробка...' : 'Підтвердити замовлення'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default CartPage;
