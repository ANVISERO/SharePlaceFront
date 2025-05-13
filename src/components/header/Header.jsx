import React from 'react';
import {Link, NavLink} from 'react-router-dom';
import './Header.css';

function Header() {
    return (
        <header className="app-header">
            <div className="logo">
                <Link to="/">SharePlace</Link>
            </div>
            <nav className="navigation">
                <ul>
                    <li>
                        <NavLink
                            to="/"
                            className={({isActive}) => (isActive ? 'active-link' : '')}
                        >
                            Главная
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/profile"
                            className={({isActive}) => (isActive ? 'active-link' : '')}
                        >
                            Профиль
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/chat"
                            className={({isActive}) => (isActive ? 'active-link' : '')}
                        >
                            Чат
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/yandex-login"
                            className={({isActive}) => (isActive ? 'active-link' : '')}
                        >
                            Войти
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;