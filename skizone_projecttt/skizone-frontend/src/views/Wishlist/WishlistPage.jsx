import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../../components/ModalMessage';

function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, title: '', message: '' });
    const closeModal = () => setModal({ show: false, title: '', message: '' });

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get('http://localhost:5000/api/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlist(response.data);
            setLoading(false);
        } catch (error) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Не вдалося завантажити список бажань'
            });
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/wishlist/remove/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModal({
                show: true,
                title: 'Успіх',
                message: 'Товар видалено зі списку бажань'
            });
            fetchWishlist();
        } catch (error) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Не вдалося видалити товар зі списку бажань'
            });
        }
    };

    const handleAddToCart = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Спочатку увійдіть у систему'
            });
            return;
        }
        try {
            await axios.post(
                'http://localhost:5000/api/cart/add',
                { productId, quantity: 1 },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setModal({
                show: true,
                title: 'Успіх',
                message: 'Товар додано до кошика'
            });
        } catch (error) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Не вдалося додати товар у кошик'
            });
        }
    };

    if (loading) return <div className="wishlist-container">Завантаження...</div>;

    return (
        <div className="wishlist-container">
            <ModalMessage
                show={modal.show}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
            />
            <h2 className="wishlist-title">Мої бажання</h2>
            {wishlist.length === 0 ? (
                <p className="empty-wishlist">Ваш список бажань порожній</p>
            ) : (
                <div className="products-list">
                    {wishlist.map((product) => (
                        <div key={product._id} className="product-card">
                            {product.imagePath ? (
                                <img
                                    src={`http://localhost:5000/${product.imagePath}`}
                                    alt={product.name}
                                    className="product-image"
                                />
                            ) : (
                                <div className="no-image">Немає фото</div>
                            )}
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-price">Ціна: ${product.price}</p>
                            <p className="product-category">{product.category}</p>
                            <p className="product-description">{product.description}</p>
                            <div className="product-buttons">
                                <button
                                    className="add-cart-btn"
                                    onClick={() => handleAddToCart(product._id)}
                                >
                                    В кошик
                                </button>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveFromWishlist(product._id)}
                                >
                                    Видалити
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WishlistPage;
