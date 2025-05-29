// pages/index.jsx або HomePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalMessage from '../components/ModalMessage';
import styles from '../styles/HomePage.module.css'; 

function HomePage() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState({ show: false, title: '', message: '' });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Усі категорії');

  const closeModal = () => setModal({ show: false, title: '', message: '' });

  useEffect(() => {
    axios.get('http://localhost:5001/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setModal({ show: true, title: 'Помилка', message: 'Не вдалося завантажити товари' }));
  }, []);

  const categories = ['Усі категорії', ...Array.from(new Set(products.map(prod => prod.category)))];

  const filteredProducts = products.filter(prod => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(search.toLowerCase()) || 
      prod.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Усі категорії' || prod.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setModal({
        show: true,
        title: 'Помилка',
        message: 'Спочатку увійдіть у систему, щоб додати товар у кошик'
      });
      return;
    }

    axios.post('http://localhost:5001/api/cart/add', { productId, quantity: 1 }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setModal({ show: true, title: 'Успіх', message: 'Товар додано до кошика' });
      })
      .catch(() => {
        setModal({ show: true, title: 'Помилка', message: 'Не вдалося додати товар у кошик' });
      });
  };

  return (
    <div className={styles.homePage}>
      <ModalMessage 
        show={modal.show} 
        onClose={closeModal} 
        title={modal.title} 
        message={modal.message} 
      />

      <div className={styles.banner}>
        <h1 className={styles.siteTitle}>SkiZone</h1>
        <p className={styles.siteSubtitle}>
          Тут можна знайти все необхідне для катання на лижах: одяг, аксесуари та спорядження
        </p>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select
          className={styles.categorySelect}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className={styles.productsList}>
        {filteredProducts.length === 0 ? (
          <p className={styles.noProducts}>Немає товарів за вашим запитом</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product._id} className={styles.productCard}>
              {product.imagePath ? (
                <img
                  src={`http://localhost:5001/${product.imagePath}`}
                  alt={product.name}
                  className={styles.productImage}
                />
              ) : (
                <div className={styles.noImage}>Немає фото</div>
              )}
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>Ціна: ${product.price}</p>
              <p className={styles.productCategory}>{product.category}</p>
              <p className={styles.productDescription}>{product.description}</p>
              <button 
                className={styles.addCartBtn} 
                onClick={() => handleAddToCart(product._id)}
              >
                В кошик
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HomePage;