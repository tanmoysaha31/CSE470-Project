import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faBell } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/theme.css';

export default function DashboardNavbar() {
    const [showAuthMenu, setShowAuthMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleDashboard = () => {
        navigate("/Dashboard/Overview");
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };
    const toggleAuthMenu = () => {
        setShowAuthMenu(!showAuthMenu);
    };
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <nav className="navbar sticky-top shadow-sm">
            <div className="container d-flex justify-content-between">
                <button 
                    className="border-0 fs-5 bg-transparent" 
                    onClick={handleDashboard}
                    style={{ color: theme === 'light' ? 'black' : 'white' }}
                >
                    <img src="/vite.svg" className="me-2" style={{ width: "22px", marginRight: "8px" }} alt="logo" />
                    LifeSync
                </button>
                <div className="d-flex align-items-center">
                    <button 
                        className="btn btn-outline-secondary me-3 d-flex align-items-center justify-content-center"
                        onClick={toggleTheme}
                        style={{ 
                            color: theme === 'light' ? 'black' : 'white',
                            width: '40px',
                            height: '40px',
                            padding: '0'
                        }}
                    >
                        <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
                    </button>

                    {/* Add Notification Bell Here */}
                    <div className="notification-menu-container me-3">
                        <button 
                            className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                            onClick={toggleNotifications}
                            style={{ 
                                color: theme === 'light' ? 'black' : 'white',
                                width: '40px',
                                height: '40px',
                                padding: '0'
                            }}
                        >
                            <FontAwesomeIcon icon={faBell} />
                        </button>
                        {showNotifications && (
                            <div className="notification-popup-menu">
                                <div className="notification-header">
                                    <span>Notifications</span>
                                </div>
                                <hr className="notification-divider"/>
                                <div className="notification-item">
                                    <span>No new notifications</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <ul className="navbar-nav flex-row fs-6">
                        <li className="nav-item me-3">
                            <Link 
                                className="nav-link" 
                                to="/about"
                                style={{ color: theme === 'light' ? 'black' : 'white' }}
                            ></Link>
                        </li>
                        <div className="auth-menu-container">
                            <button 
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={toggleAuthMenu}
                                style={{ color: theme === 'light' ? 'black' : 'white' }}
                            >
                                Auth
                            </button>
                            {showAuthMenu && (
                                <div className="auth-popup-menu">
                                    <Link className="auth-menu-item" to="/login">Login</Link>
                                    <Link className="auth-menu-item" to="/register">Register</Link>
                                    <hr className="auth-divider"/>
                                    <Link className="auth-menu-item" to="/logout">Logout</Link>
                                </div>
                            )}
                        </div>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
