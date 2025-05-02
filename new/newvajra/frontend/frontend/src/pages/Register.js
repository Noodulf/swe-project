import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/common.css";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "manager", // default role
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("🎉 Registration successful! Please login.");
        toast.success("User ID is " + data.user_id);
        navigate("/login");
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      toast.error("Server error. Try again later.");
      console.error(err);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>📝 Register</h2>
        <form onSubmit={handleRegister}>
          <label>Full Name:</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="manager">Manager</option>
            <option value="sales_clerk">Sales Clerk</option>
            <option value="chef">Chef</option>
          </select>

          <button type="submit" className="register-btn">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
