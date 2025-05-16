import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../../context/userContext';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faBell } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/theme.css';
import axios from 'axios';

export default function DashboardNavbar() {
    const { user, setUser } = useContext(UserContext);
    const [showAuthMenu, setShowAuthMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    
    // Add these refs after your state declarations
    const authMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);
    const authButtonRef = useRef(null);
    const notificationButtonRef = useRef(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Add this useEffect hook after your existing useEffect
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside auth menu
            if (showAuthMenu && 
                authMenuRef.current && 
                authButtonRef.current && 
                !authMenuRef.current.contains(event.target) && 
                !authButtonRef.current.contains(event.target)) {
                setShowAuthMenu(false);
            }

            // Check if click is outside notification menu
            if (showNotifications && 
                notificationMenuRef.current && 
                notificationButtonRef.current && 
                !notificationMenuRef.current.contains(event.target) && 
                !notificationButtonRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAuthMenu, showNotifications]);

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

    const handleProfileClick = () => {
        setShowAuthMenu(false); // Close the menu after clicking
        navigate('/Dashboard/Profile');
    };

    // Helper function to get first letter of first name
    const getInitial = () => {
        if (!user || !user.name) return '';
        return user.name.charAt(0).toUpperCase();
    };

    const handleLogout = async () => {
        try {
            // Clear the cookie containing JWT token
            await axios.post('/logout');
            
            // Clear any user data from context
            setUser(null);
            
            // Clear any stored data from localStorage
            localStorage.clear();
            
            // Redirect to login page
            navigate('/login');
            
            // Force a full page reload to clear any cached data
            window.location.reload();
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed');
        }
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
                        className="btn d-flex align-items-center justify-content-center me-3"
                        onClick={toggleTheme}
                        style={{ 
                            color: theme === 'light' ? '#333' : 'white',
                            width: '40px',
                            height: '40px',
                            padding: '0',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            border: `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
                    </button>

                    {/* Notification Bell */}
                    <div className="notification-menu-container me-3">
                        <button 
                            ref={notificationButtonRef}
                            className="btn d-flex align-items-center justify-content-center"
                            onClick={toggleNotifications}
                            style={{ 
                                color: theme === 'light' ? '#333' : 'white',
                                width: '40px',
                                height: '40px',
                                padding: '0',
                                borderRadius: '50%',
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <FontAwesomeIcon icon={faBell} />
                        </button>
                        {showNotifications && (
                            <div 
                                ref={notificationMenuRef}
                                className="notification-popup-menu"
                            >
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

                    {/* Profile Button */}
                    <div className="auth-menu-container">
                        <button 
                            ref={authButtonRef}
                            className="btn d-flex align-items-center justify-content-center"
                            onClick={toggleAuthMenu}
                            style={{ 
                                color: theme === 'light' ? '#333' : 'white',
                                width: '40px',
                                height: '40px',
                                padding: '0',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {user?.profilePicture ? (
                                <img 
                                    src={`http://localhost:8000${user.profilePicture}`}
                                    alt="Profile" 
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <span style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    fontWeight: '500'
                                }}>
                                    {getInitial()}
                                </span>
                            )}
                        </button>
                        {showAuthMenu && (
                            <div 
                                ref={authMenuRef}
                                className="auth-popup-menu"
                            >
                                <div className="auth-menu-header p-2">
                                    <small className="d-block text-muted">Signed in as</small>
                                    <strong>{user?.name}</strong>
                                </div>
                                <hr className="auth-divider m-0"/>
                                <Link 
                                    className="auth-menu-item" 
                                    to="/Dashboard/Profile"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleProfileClick();
                                    }}
                                >
                                    Profile
                                </Link>
                                <Link 
                                    className="auth-menu-item" 
                                    to="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleLogout();
                                    }}
                                >
                                    Logout
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
