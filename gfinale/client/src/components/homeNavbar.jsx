import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/theme.css';

export default function HomeNavbar() {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleHome = () => {
        navigate("/");
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <nav className="navbar sticky-top shadow-sm">
            <div className="container d-flex justify-content-between">
                <button 
                    className="border-0 fs-5 bg-transparent" 
                    onClick={handleHome}
                    style={{ color: theme === 'light' ? 'black' : 'white' }}
                >
                    <img src="/vite.svg" className="me-2" style={{ width: "22px", marginRight: "8px" }} alt="logo" />
                    LifeSync
                </button>
                <div className="d-flex align-items-center">
                    {/* <button 
                        className="btn btn-outline-secondary me-3 d-flex align-items-center gap-2"
                        onClick={toggleTheme}
                        style={{ color: theme === 'light' ? 'black' : 'white' }}
                    >
                        <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
                        {theme === 'light' ? 'Dark' : 'Light'} Mode
                    </button> */}
                    <ul className="navbar-nav flex-row fs-6">
                        <li className="nav-item me-3">
                            <Link 
                                className="nav-link" 
                                to="/about"
                                style={{ color: theme === 'light' ? 'black' : 'white' }}
                            ></Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className="nav-link" 
                                to="/login"
                                style={{ color: theme === 'light' ? 'black' : 'white' }}
                            >
                                Account
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
