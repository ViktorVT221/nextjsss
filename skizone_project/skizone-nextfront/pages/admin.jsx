// pages/admin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../components/ModalMessage';
import { useRouter } from 'next/router'; 

import styles from '../styles/AdminPage.module.css';

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [modal, setModal] = useState({ show: false, title: '', message: '' });

  const router = useRouter();

  const closeModal = () => setModal({ show: false, title: '', message: '' });

  // 🔐 Перевірка авторизації
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      router.push('/'); // 🔁 якщо не адмін — назад
    } else {
      fetchProducts();
    }
  }, [router]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/products');
      setProducts(res.data);
    } catch (error) {
      setModal({ show: true, title: 'Помилка', message: 'Не вдалося завантажити товари' });
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.price) < 0) {
      setModal({ show: true, title: 'Помилка', message: 'Ціна не може бути від’ємною' });
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      };

      if (isEditing) {
        await axios.put(`http://localhost:5001/api/products/${editId}`, data, { headers });
        setModal({ show: true, title: 'Успіх', message: 'Товар оновлено!' });
      } else {
        await axios.post('http://localhost:5001/api/products', data, { headers });
        setModal({ show: true, title: 'Успіх', message: 'Товар додано!' });
      }

      setFormData({ name: '', description: '', price: '', category: '' });
      setSelectedFile(null);
      setIsEditing(false);
      setEditId(null);
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      setModal({ show: true, title: 'Помилка', message: 'Не вдалося зберегти товар' });
    }
  };

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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setModal({ show: true, title: 'Успіх', message: 'Товар видалено' });
      fetchProducts();
    } catch (error) {
      setModal({ show: true, title: 'Помилка', message: 'Не вдалося видалити товар' });
    }
  };

  return (
    <div className={styles.adminContainer}>
      <ModalMessage show={modal.show} onClose={closeModal} title={modal.title} message={modal.message} />

      <h2>Адмін-панель</h2>

      <button
        className={styles.toggleFormBtn}
        onClick={() => {
          setShowForm(!showForm);
          setIsEditing(false);
          setFormData({ name: '', description: '', price: '', category: '' });
        }}
      >
        {showForm ? 'Скасувати' : 'Додати товар'}
      </button>

      {showForm && (
        <form className={styles.adminForm} onSubmit={handleFormSubmit}>
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

      <div className={styles.adminProductsList}>
        {products.map(product => (
          <div key={product._id} className={styles.adminProductItem}>
            <h4>{product.name} (${product.price})</h4>
            <p>{product.description}</p>
            {product.imagePath && (
              <img
                src={`http://localhost:5001/${product.imagePath}`}
                alt={product.name}
                style={{ width: '100%', borderRadius: '4px' }}
              />
            )}
            <p><em>Категорія: {product.category}</em></p>
            <div className={styles.adminItemButtons}>
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