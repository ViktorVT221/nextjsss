import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../../components/ModalMessage';

function HomePage() {
    const [products, setProducts] = useState([]);
    const [modal, setModal] = useState({ show: false, title: '', message: '' });
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Усі категорії');
    const [sortBy, setSortBy] = useState('');

    const closeModal = () => setModal({ show: false, title: '', message: '' });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products');
            let sortedProducts = [...response.data];

            // Сортування продуктів
            switch (sortBy) {
                case 'priceAsc':
                    sortedProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'priceDesc':
                    sortedProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'nameAsc':
                    sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'uk-UA'));
                    break;
                case 'dateDesc':
                    sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                default:
                    break;
            }

            setProducts(sortedProducts);
        } catch (error) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Не вдалося завантажити товари'
            });
        }
    };

    // Динамічно формуємо список категорій з отриманих товарів
    const categories = [
        'Усі категорії',
        ...Array.from(new Set(products.map((prod) => prod.category)))
    ];
    const filteredProducts = products
        .filter((prod) => {
            const matchesSearch =
                prod.name.toLowerCase().includes(search.toLowerCase()) ||
                prod.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === 'Усі категорії' || prod.category === category;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'priceAsc':
                    return a.price - b.price; // від дешевих до дорогих
                case 'priceDesc':
                    return b.price - a.price; // від дорогих до дешевих
                case 'nameAsc':
                    return a.name.localeCompare(b.name, undefined, {
                        sensitivity: 'base',
                        ignorePunctuation: true,
                        usage: 'sort'
                    });
                case 'dateDesc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

    const handleAddToCart = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Спочатку увійдіть у систему, щоб додати товар у кошик'
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

    const handleAddToWishlist = async (productId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Спочатку увійдіть у систему, щоб додати товар у список бажань'
            });
            return;
        }
        try {
            await axios.post(
                'http://localhost:5000/api/wishlist/add',
                { productId },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setModal({
                show: true,
                title: 'Успіх',
                message: 'Товар додано до списку бажань'
            });
        } catch (error) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Не вдалося додати товар у список бажань'
            });
        }
    };

    return (
        <div className="home-page">
            <ModalMessage
                show={modal.show}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
            />

            <div className="banner">
                <h1 className="site-title">SkiZone</h1>
                <p className="site-subtitle">
                    Тут можна знайти все необхідне для катання на лижах: одяг, аксесуари та
                    спорядження
                </p>
            </div>

            <div className="search-filters">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Пошук..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <select
                        className="category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <div className="sort-select">
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                fetchProducts();
                            }}
                        >
                            <option value="">За замовчуванням</option>
                            <option value="priceAsc">Ціна: від дешевих до дорогих</option>
                            <option value="priceDesc">Ціна: від дорогих до дешевих</option>
                            <option value="nameAsc">За назвою (А-Я)</option>
                            <option value="dateDesc">За датою додавання</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="products-list">
                {filteredProducts.length === 0 ? (
                    <p className="no-products">Немає товарів за вашим запитом</p>
                ) : (
                    filteredProducts.map((product) => (
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
                                    className="add-wishlist-btn"
                                    onClick={() => handleAddToWishlist(product._id)}
                                >
                                    ❤ В обране
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default HomePage;
