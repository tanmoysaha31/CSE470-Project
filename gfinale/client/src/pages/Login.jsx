import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const loginUser = async (e) => {
        e.preventDefault();
        console.log("User Login:", formData);
        const { email, password } = formData;
        try {
            const { data } = await axios.post("/login", {
                email,
                password
            });
            if (data.error) {
                toast.error(data.error);
            } else {
                setFormData({});
                toast.success("Login successful");
                navigate("/Dashboard/Overview");
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong during login");
        }
    };

    return (
        <div className="container">
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="card p-4 border-0" style={{ width: "500px", maxWidth: "100%" }}>
                <div className="text-center mb-5">
                <div className="d-flex align-items-center justify-content-center">
                    <img
                    src="/vite.svg"
                    style={{ width: "50px", height: "auto" }}
                    alt="Logo"
                    className="me-3"
                    />
                    <div className="text-start">
                    <div className="fs-4">LifeSync</div>
                    <div className="fs-6">Your personal life management tool</div>
                    </div>
                </div>
                </div>

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

                            <div className="my-3 text-center"></div>
                            {/* <button type="button" className="btn btn-outline-secondary w-100 mb-3">
                                    <img 
                                            src="google-color-icon.svg" 
                                            alt="Google logo" 
                                            style={{ width: "20px", marginRight: "8px" }}
                                    />
                                    Login with Google
                            </button> */}
                    </form>

                    <div className="text-center">
                            Don't have an account? <a href="/register">Register</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
