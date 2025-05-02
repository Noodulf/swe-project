// src/pages/SupplyRequest.js
import React, { useState, useEffect } from "react";
import "../styles/common.css";
import "./SupplyRequest.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function SupplyRequest() {
  const [ingredients, setIngredients] = useState([]);
  const [requests, setRequests] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/inventory/chef")  // ✅ Replace with correct API if needed
      .then((res) => res.json())
      .then((data) => {
        setIngredients(data); // Assuming backend sends array of ingredients
      })
      .catch((err) => {
        console.error("Failed to fetch ingredients:", err);
        toast.error("Failed to load ingredients ❌");
      });
  }, []);

  const handleRequestChange = (id, qty) => {
    setRequests(prev => ({
      ...prev,
      [id]: qty
    }));
  };

  const handleSendRequests = () => {
    const requestList = Object.entries(requests)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const ing = ingredients.find(i => i.id === parseInt(id));
        return { ingredientId: ing.id, quantity: parseFloat(qty) };
      });

    if (requestList.length === 0) {
      toast.error("No quantity specified!");
      return;
    }

    // POST request to send supply requests to backend
    fetch("http://localhost:3000/api/supply-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}` // 🔐 if auth is needed
      },
      body: JSON.stringify({ requests: requestList })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to send supply request");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Supply Request Sent:", data);
        toast.success("Supply request sent successfully ✅");
        setRequests({});
      })
      .catch((err) => {
        console.error("Supply request error:", err);
        toast.error("Failed to send request ❌");
      });
  };

  return (
    <div className="page-container supply-page">
      <h2 className="supply-header">🍳 Supply Request</h2>
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <p className="supply-subtext">
        Select ingredients and specify the quantity you need.
      </p>

      <div className="table-wrapper">
        <table className="supply-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Unit</th>
              <th>Quantity Needed</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => (
              <tr key={ing.id}>
                <td>{ing.name}</td>
                <td>{ing.unit}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2"
                    value={requests[ing.id] || ""}
                    onChange={(e) => handleRequestChange(ing.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <br />
      <button className="submit-request-btn" onClick={handleSendRequests}>
        📦 Send Request
      </button>

      {/* ✨ Footer */}
      <div className="thank-you-banner">
        <img
          src="/images/chef-hat.png"
          alt="Chef Hat"
          className="thank-you-icon"
        />
        <p>Thank you for keeping the kitchen running smoothly! 🍳✨</p>
      </div>
    </div>
  );
}

export default SupplyRequest;
