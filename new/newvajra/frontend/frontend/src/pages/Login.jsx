import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "../styles/common.css";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ userid: "", password: "" });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Temporarily bypass authentication for testing
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", "dummy-token");
    toast.success("Login successful ✅");
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2>🍽️ Welcome</h2>
        <p>Login below</p>

        <form onSubmit={handleLogin}>
          <label>UserID:</label>
          <input
            type="text"
            name="userid"
            placeholder="Enter username"
            value={credentials.userid}
            onChange={handleChange}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={credentials.password}
            onChange={handleChange}
            required
          />

          <motion.button
            type="submit"
            className="login-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </form>
      </motion.div>

      <motion.img
        src="/images/login-bg.jpg"
        alt="Food Background"
        className="login-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.2 }}
      />
    </div>
  );
}

export default Login;
