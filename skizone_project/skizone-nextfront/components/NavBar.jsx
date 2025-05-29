// components/NavBar.jsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/NavBar.module.css';

function NavBar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role') || '';
    setIsLoggedIn(!!token);
    setRole(userRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/');
    window.location.reload(); // можна прибрати, якщо стан оновлюється через API
  };

  return (
    <nav className={`${styles.navBar} ${styles.fadeInAnimation}`}>
      <div className={styles.navlogo}>SkiZone</div>

      <ul className={styles.navlinks}>
        <li><Link href="/">Головна</Link></li>

        {/* Показуємо посилання на Кошик і Акаунт лише для авторизованих */}
        {isLoggedIn && (
          <>
            {role === 'admin' ? (
              <li><Link href="/admin">Адмін-панель</Link></li>
            ) : (
              <>
                <li><Link href="/account">Акаунт</Link></li>
                <li><Link href="/cart">Кошик</Link></li>
              </>
            )}
            <li>
              <button className={styles.logoutbtn} onClick={handleLogout}>
                Вийти
              </button>
            </li>
          </>
        )}

        {/* Посилання для незалогінених */}
        {!isLoggedIn && (
          <>
            <li><Link href="/login">Увійти</Link></li>
            <li><Link href="/register">Реєстрація</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;