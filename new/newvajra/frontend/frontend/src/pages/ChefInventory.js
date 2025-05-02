import React, { useEffect, useState } from "react";
import "../styles/common.css";
import "./ChefInventory.css";
import { useNavigate } from "react-router-dom";

function ChefInventory() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChefInventory = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/inventory/chef");
        if (!response.ok) {
          throw new Error('Failed to fetch inventory');
        }
        const data = await response.json();
        if (data.success) {
          setIngredients(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch inventory');
        }
      } catch (err) {
        console.error("Error fetching chef inventory:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChefInventory();
  }, []);

  return (
    <div className="page-container chef-page">
      <h2 className="chef-header">👨‍🍳 Chef Inventory View</h2>
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      {loading ? (
        <p className="loading-text">Loading inventory...</p>
      ) : error ? (
        <p className="error-text">Error: {error}</p>
      ) : ingredients.length === 0 ? (
        <p className="loading-text">No ingredients available.</p>
      ) : (
        <div className="table-wrapper">
          <table className="chef-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Quantity</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((item) => (
                <tr key={item.ingredient}>
                  <td>{item.ingredient}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="chef-footer">
        <img src="/images/chef1.jpg" alt="Chef 1" />
        <img src="/images/chef2.jpg" alt="Chef 2" />
        <img src="/images/chef3.jpg" alt="Chef 3" />
        <img src="/images/chef4.jpg" alt="Chef 4" />
      </div>
    </div>
  );
}

export default ChefInventory;