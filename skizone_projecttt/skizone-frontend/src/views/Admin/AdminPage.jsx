// src/pages/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../../components/ModalMessage';

function AdminPage() {
    // Стан для списку товарів
    const [products, setProducts] = useState([]);

    // Стан, чи показувати форму
    const [showForm, setShowForm] = useState(false);

    // Стан, чи зараз редагуємо (true) чи створюємо (false)
    const [isEditing, setIsEditing] = useState(false);

    // ID товару, який редагуємо (якщо isEditing === true)
    const [editId, setEditId] = useState(null);

    // Поля форми
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: ''
    });

    // Стан для файлу зображення
    const [selectedFile, setSelectedFile] = useState(null);

    // Стан модального вікна
    const [modal, setModal] = useState({
        show: false,
        title: '',
        message: ''
    });
    const closeModal = () => setModal({ show: false, title: '', message: '' });

    // 1. Функція завантаження списку товарів
    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            setProducts(res.data);
        } catch (error) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Не вдалося завантажити товари'
            });
        }
    };

    // Завантажуємо товари при першому відмальовуванні компонента
    useEffect(() => {
        fetchProducts();
    }, []);

    // 2. Обробка змін у полях форми
    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // 3. Надсилання форми (додавання або редагування)
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Перевірка: ціна не може бути від’ємною
        if (Number(formData.price) < 0) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Ціна не може бути від’ємною'
            });
            return;
        }

        try {
            // Готуємо FormData
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('category', formData.category);
            if (selectedFile) {
                data.append('image', selectedFile);
            }

            // Заголовок із токеном
            const headers = {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            };

            // Якщо редагуємо товар
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/products/${editId}`, data, {
                    headers
                });
                setModal({ show: true, title: 'Успіх', message: 'Товар оновлено!' });
            } else {
                // Якщо створюємо новий товар
                await axios.post('http://localhost:5000/api/products', data, {
                    headers
                });
                setModal({ show: true, title: 'Успіх', message: 'Товар додано!' });
            }

            // Очищуємо форму
            setFormData({
                name: '',
                description: '',
                price: '',
                category: ''
            });
            setSelectedFile(null);
            setIsEditing(false);
            setEditId(null);
            setShowForm(false);

            // Оновлюємо список товарів
            fetchProducts();
        } catch (error) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Не вдалося зберегти товар'
            });
        }
    };

    // 4. Обробник редагування (заповнює поля форми)
    const handleEdit = (product) => {
        setIsEditing(true);
        setEditId(product._id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category
        });
        setSelectedFile(null);
        setShowForm(true);
    };

    // 5. Обробник видалення товару
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setModal({ show: true, title: 'Успіх', message: 'Товар видалено' });
            fetchProducts();
        } catch (error) {
            setModal({
                show: true,
                title: 'Помилка',
                message: 'Не вдалося видалити товар'
            });
        }
    };

    return (
        <div className="admin-container">
            {/* Модальне вікно */}
            <ModalMessage
                show={modal.show}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
            />

            <h2>Адмін-панель</h2>

            {/* Кнопка для відкриття/закриття форми */}
            <button
                className="toggle-form-btn"
                onClick={() => {
                    setShowForm(!showForm);
                    setIsEditing(false);
                    setFormData({ name: '', description: '', price: '', category: '' });
                }}
            >
                {showForm ? 'Скасувати' : 'Додати товар'}
            </button>

            {/* Форма створення/редагування товару */}
            {showForm && (
                <form className="admin-form" onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Назва"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Опис"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Ціна"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        placeholder="Категорія"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                    />
                    <input type="file" onChange={handleFileChange} />
                    <button type="submit">{isEditing ? 'Оновити товар' : 'Додати товар'}</button>
                </form>
            )}

            {/* Список товарів */}
            <div className="admin-products-list">
                {products.map((product) => (
                    <div key={product._id} className="admin-product-item">
                        <h4>
                            {product.name} (${product.price})
                        </h4>
                        <p>{product.description}</p>
                        {product.imagePath && (
                            <img
                                src={`http://localhost:5000/${product.imagePath}`}
                                alt={product.name}
                            />
                        )}
                        <p>
                            <em>Категорія: {product.category}</em>
                        </p>
                        <div className="admin-item-buttons">
                            <button onClick={() => handleEdit(product)}>Редагувати</button>
                            <button onClick={() => handleDelete(product._id)}>Видалити</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPage;
