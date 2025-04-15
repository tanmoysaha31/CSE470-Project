import React from 'react'
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link } from "react-router-dom";

export default function homeNavbar() {
    const navigate = useNavigate();
    
        const handleHome = () => {
            navigate("/");
    };
return (
    <nav className="navbar sticky-top bg-light shadow-sm">
        <div className="container d-flex justify-content-between">
            <button class="border-0 bg-light fs-5" onClick={handleHome}>
                <img src="/vite.svg" className="me-2" style={{ width: "22px", marginRight: "8px" }}></img>
                LifeSync
            </button>
            <ul className="navbar-nav flex-row fs-6">
                <li className="nav-item me-3">
                        <Link className="nav-link" to="/about">
                                
                        </Link>
                </li>
                <li className="nav-item">
                        <Link className="nav-link" to="/login">
                                Account
                        </Link>
                </li>
            </ul>
        </div>
    </nav>
)
}
