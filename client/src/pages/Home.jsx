import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function home() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/register");
    };

    return (
        <div className="container text-center mt-5">
            <h1 className="mb-3">Welcome to LifeSync</h1>
            <h4 className="mb-3">Make your life easy</h4>
            <button className="btn btn-primary mb-3" onClick={handleGetStarted}>Get Started</button>
            <p className="mb-3">LifeSync is a web application that helps you manage your tasks and schedule</p>
        </div>
    );
}
