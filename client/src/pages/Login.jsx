import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const loginUser = (e) => {
        e.preventDefault();
        console.log("User Login:", formData);
    };

    return (
        <div className="d-flex justify-content-center align-items-center">
                <div className="card shadow p-4" style={{ width: "500px" }}>
                        <h2 className="text-center mb-4">Login to Your Account</h2>
                        <form onSubmit={loginUser}>
                                <div className="mb-3">
                                        <label className="form-label text-start w-100">Email</label>
                                        <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                placeholder="example@mail.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                        />
                                </div>

                                <div className="mb-3">
                                        <label className="form-label text-start w-100">Password</label>
                                        <input
                                                type="password"
                                                name="password"
                                                className="form-control"
                                                placeholder="********"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                        />
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                        Login
                                </button>

                                <div className="my-3">
                                        <span className="text-muted"></span>
                                </div>

                                <button type="button" className="btn btn-outline-secondary w-100 mb-3">
                                        <img 
                                                src="google-color-icon.svg" 
                                                alt="Google logo" 
                                                style={{ width: "20px", marginRight: "8px" }}
                                        />
                                        Login with Google
                                </button>
                        </form>

                        <div className="text-center">
                                Don't have an account? <a href="/register">Register</a>
                        </div>
                </div>
        </div>
    );
}
