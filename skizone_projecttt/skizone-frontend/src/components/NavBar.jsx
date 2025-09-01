import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
// import './navbar.css';

function NavBar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const r = localStorage.getItem('role') || '';
        setIsLoggedIn(!!token);
        setRole(r);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.push('/');
        window.location.reload();
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="nav-bar fade-in-animation">
            <div className="nav-logo">SkiZone</div>
            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}></span>
            </button>
            <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <li>
                    <Link href="/">Головна</Link>
                </li>
                {isLoggedIn ? (
                    <>
                        {role === 'admin' ? (
                            <li>
                                <Link href="/admin">Адмін-панель</Link>
                            </li>
                        ) : (
                            <>
                                <li>
                                    <Link href="/account">Акаунт</Link>
                                </li>
                                <li>
                                    <Link href="/wishlist">Обране</Link>
                                </li>
                                <li>
                                    <Link href="/cart">Кошик</Link>
                                </li>
                            </>
                        )}
                        <li>
                            <button className="logout-btn" onClick={handleLogout}>
                                Вийти
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link href="/login">Увійти</Link>
                        </li>
                        <li>
                            <Link href="/register">Реєстрація</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default NavBar;
