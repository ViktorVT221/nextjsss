// src/pages/CatalogPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products', {
        params: { category, search, sortBy }
      });
      setProducts(res.data);
    } catch (error) {
      console.error('Помилка завантаження товарів:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, search, sortBy]);

  const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Спочатку увійдіть у систему.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/cart/add', {
        productId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Товар додано до кошика');
    } catch (error) {
      console.error('Помилка додавання в кошик:', error);
    }
  };

  return (
    <div>
      <h2>Каталог</h2>
      <div>
        <input
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Усі категорії</option>
          <option value="foundation">foundation</option>
          <option value="lipstick">lipstick</option>
          <option value="eyeshadow">eyeshadow</option>
          <option value="skincare">skincare</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Без сортування</option>
          <option value="priceAsc">Ціна за зростанням</option>
          <option value="priceDesc">Ціна за спаданням</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map(prod => (
          <div
            key={prod._id}
            style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', width: '220px' }}
          >
            <h3>{prod.name}</h3>
            {prod.imagePath ? (
              <img
                src={`http://localhost:5000/${prod.imagePath}`}
                alt={prod.name}
                className="product-image"
              />
            ) : (
              <div style={{ width: '200px', height: '200px', backgroundColor: '#f0f0f0' }}>
                (Немає фото)
              </div>
            )}
            <p>Ціна: ${prod.price}</p>
            <button onClick={() => addToCart(prod._id)}>В кошик</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CatalogPage;
