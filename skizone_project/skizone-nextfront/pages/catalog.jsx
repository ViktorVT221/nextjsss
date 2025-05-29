// pages/catalog.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../components/ModalMessage'; 
import styles from '../styles/HomePage.module.css'; 

function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [modal, setModal] = useState({ show: false, title: '', message: '' });

  const closeModal = () => setModal({ show: false, title: '', message: '' });

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/products', {
        params: { category, search, sortBy }
      });
      setProducts(res.data);
    } catch (error) {
      setModal({ show: true, title: 'Помилка', message: 'Не вдалося завантажити товари' });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, search, sortBy]);

  const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setModal({ show: true, title: 'Помилка', message: 'Спочатку увійдіть у систему.' });
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/cart/add', {
        productId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModal({ show: true, title: 'Успіх', message: 'Товар додано до кошика' });
    } catch (error) {
      setModal({ show: true, title: 'Помилка', message: 'Не вдалося додати в кошик' });
    }
  };

  return (
    <div className={styles.catalogContainer}>
      <ModalMessage show={modal.show} onClose={closeModal} title={modal.title} message={modal.message} />

      <div className={styles.banner}>
        <h1 className={styles.siteTitle}>Каталог товарів</h1>
        <p className={styles.siteSubtitle}>Фільтруй, шукай, сортуй — і обирай!</p>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select className={styles.categorySelect} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Усі категорії</option>
          <option value="foundation">Тональні основи</option>
          <option value="lipstick">Помади</option>
          <option value="eyeshadow">Тіні</option>
          <option value="skincare">Догляд</option>
        </select>
        <select className={styles.categorySelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Без сортування</option>
          <option value="priceAsc">Ціна за зростанням</option>
          <option value="priceDesc">Ціна за спаданням</option>
        </select>
      </div>

      <div className={styles.productsList}>
        {products.length === 0 ? (
          <p className={styles.noProducts}>Немає товарів за заданими параметрами</p>
        ) : (
          products.map(prod => (
            <div key={prod._id} className={styles.productCard}>
              {prod.imagePath ? (
                <img src={`http://localhost:5001/${prod.imagePath}`} alt={prod.name} className={styles.productImage} />
              ) : (
                <div className={styles.noImage}>Немає фото</div>
              )}
              <h3 className={styles.productName}>{prod.name}</h3>
              <p className={styles.productPrice}>Ціна: ${prod.price}</p>
              <p className={styles.productCategory}>{prod.category}</p>
              <p className={styles.productDescription}>{prod.description}</p>
              <button className={styles.addCartBtn} onClick={() => addToCart(prod._id)}>В кошик</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CatalogPage;