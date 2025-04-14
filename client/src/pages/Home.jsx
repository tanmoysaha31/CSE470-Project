import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/homeNavbar";
import '../assets/styles/home.css';

export default function Home() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/register");
    };

    return (
        <>
        <Navbar />
        <div className="container text-center mt-5">
            <h1 className="mb-4 super-big">Master Your Moments</h1>
            <h4 className="mb-4 mid-big">Your one and only Personal Life Management Webapp</h4>
            <button className="btn btn-primary btn-lg mb-5" onClick={handleGetStarted}>Get Started</button>
        </div>
        <div className="container text-center mt-5 mb-5">
            <img src="img-1.png" className="logo" height={440} width={650}/>
        </div>
        <div className="container text-center mt-5">
            <div className="mb-5">
                <h1 className="mb-4 mid-big">Your life, your flow</h1>
                <h4 className="mb-5 mid-mid">LifeSync keeps everything in sync — tasks, events, habits — designed around the way you live and work</h4>
            </div>
            <div className="mb-5">
                <h1 className="mb-4 mid-big">You're always in control</h1>
                <h4 className="mb-5 mid-mid">Your plans, your data. Stored securely, accessible only to you. LifeSync respects your privacy — no cloud lock-ins</h4>
            </div>
            <div className="mb-5">
                <h1 className="mb-4 mid-big">Your routine, reimagined</h1>
                <h4 className="mb-5 mid-mid">LifeSync learns how you work best and offers meaningful suggestions to optimize your day — not overload it</h4>
            </div>
        </div>
        </>
    );
}
