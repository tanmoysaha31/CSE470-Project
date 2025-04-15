import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios"; 
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password } = formData;
    try {
        const {data} = await axios.post("/register", {
            firstname: firstName,
            lastname: lastName,
            email,
            password
        })
        if (data.error) {
            toast.error(data.error)
        }else{
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
            });
            toast.success('Registration successful')
            navigate("/login")
        }
    }catch{
        toast.error("Something went wrong")
    }
  };

  return (
    <div className="container">
    <div className="d-flex justify-content-center align-items-center min-vh-100">
        
        <div className="card p-4 border-0" style={{ width: "500px" }}>
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
            <h2 className="text-center mb-4">Create an Account</h2>
            <form onSubmit={registerUser}>
                <div className="row mb-3">
                    <div className="col">
                        <label className="form-label text-start w-100">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            className="form-control"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col">
                        <label className="form-label text-start w-100">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            className="form-control"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

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
                    Sign Up
                </button>

                <div className="my-3">
                    <span className="text-muted"></span>
                </div>

                {/* <button type="button" className="btn btn-outline-secondary w-100 mb-3">
                    <img 
                        src="google-color-icon.svg" 
                        alt="Google logo" 
                        style={{ width: "20px", marginRight: "8px" }}
                    />
                    Sign Up with Google
                </button> */}
            </form>
            <div className="text-center">
                Already registerd? <a href="/login">Login</a>
            </div>
        </div>
    </div>
    </div>
  );
}
