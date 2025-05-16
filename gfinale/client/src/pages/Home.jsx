import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/homeNavbar";
import '../assets/styles/home.css';

export default function Home() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/register");
    };

    // Add intersection observer to create scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, { threshold: 0.1 });

        // Observe all elements with the 'fade-in' class
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        return () => {
            // Clean up
            document.querySelectorAll('.fade-in').forEach(el => {
                observer.unobserve(el);
            });
        };
    }, []);

    return (
        <>
        <Navbar />
        
        {/* Hero Section */}
        <div className="hero-section text-center">
            <div className="container">
                <h1 className="mb-4 super-big fade-in">Master Your Moments</h1>
                <h4 className="mb-4 mid-big fade-in">Your one and only Personal Life Management Webapp</h4>
                <button className="btn btn-primary btn-lg mb-5 fade-in" onClick={handleGetStarted}>Get Started</button>
                <div className="feature-text-container">
                    <div className="feature-text fade-in">
                        <h2>Your life, your flow</h2>
                        <p>LifeSync keeps everything in sync — tasks, events, habits — designed around the way you live and work</p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Featured Image Section */}
        <div className="feature-image-container fade-in">
            <div className="container">
                <img src="1.png" className="main-feature-image" alt="LifeSync Dashboard" />
            </div>
            <div className="feature-text-container">
                <div className="feature-text fade-in">
                    <h2>Sync your life</h2>
                    <p>LifeSync keeps everything in sync — tasks, events, habits — designed around the way you live and work</p>
                </div>
            </div>
        </div>
        
        {/* Features Section */}
        <div className="features-section">
            {/* Feature 1 */}
            <div className="feature-card">
                <div className="container">
                    <div className="feature-image fade-in">
                        <img src="3.png" alt="Your life, your flow" />
                    </div>
                </div>
                <div className="feature-text-container">
                    <div className="feature-text fade-in">
                        <h2>LifeSync Calendar</h2>
                        <p>Create your Tasks, Events, and Habits in one place</p>
                    </div>
                </div>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card">
                <div className="container">
                    <div className="feature-image fade-in">
                        <img src="4.png" alt="LifeSync Calendar" />
                    </div>
                    <div className="feature-text-container">
                        <div className="feature-text fade-in">
                            <h2>Finance Tracker</h2>
                            <p>Track your income and expenses, and get insights on your spending</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card">
                <div className="container">
                    <div className="feature-image fade-in">
                        <img src="5.png" alt="Finance Tracker" />
                    </div>    
                </div>
                <div className="feature-text-container">
                    <div className="feature-text fade-in">
                        <h2>Notes</h2>
                        <p>Take notes, and save them for later</p>
                    </div>
                </div>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-card">
                <div className="container">
                    <div className="feature-image fade-in">
                        <img src="6.png" alt="Notes" />
                    </div>                   
                </div>
                <div className="feature-text-container">
                    <div className="feature-text fade-in">
                        <h2>LifeSync AI</h2>
                        <p>AI Assistant to help you with your tasks, Finance, and habits, and more</p>
                    </div>
                </div>
            </div>
            
            {/* Feature 5 */}
            <div className="feature-card">
                <div className="container">
                    <div className="feature-image fade-in">
                        <img src="7.png" alt="LifeSync AI" />
                    </div>
                </div>
                <div className="feature-text-container text-center">
                    <div className="feature-text fade-in">
                        <h2>Dark mode support</h2>
                        <p>Easy on your eyes, perfect for night owls</p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Modern Footer */}
        <footer className="modern-footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section about">
                        <div className="logo-container">
                            <img src="/vite.svg" alt="LifeSync Logo" className="footer-logo" />
                            <h3>LifeSync</h3>
                        </div>
                        <p className="footer-description">
                            Your personal life management solution designed to keep everything in sync and help you achieve more.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                    
                    <div className="footer-section links">
                        <h3>Quick Links</h3>
                        <ul className="footer-links">
                            <li><a href="#">Features</a></li>
                            <li><a href="#">Pricing</a></li>
                            <li><a href="#">Download</a></li>
                            <li><a href="#">About Us</a></li>
                        </ul>
                    </div>
                    
                    <div className="footer-section contact">
                        <h3>Contact Us</h3>
                        <p><i className="fas fa-map-marker-alt"></i> Dhaka, Bangladesh</p>
                        <p><i className="fas fa-envelope"></i> Not Available</p>
                        <p><i className="fas fa-phone"></i> +88001988058610</p>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} LifeSync. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
        </>
    );
}
