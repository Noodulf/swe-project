import React, { useState, useEffect } from "react";
import "../styles/common.css";
import "./InventoryManagement.css";
import { useNavigate } from "react-router-dom";

function InventoryManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchInventory = async () => {
    try {
      const response = await fetch("http://localhost:3005/api/inventory");
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
      console.error('Error fetching inventory:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleGeneratePO = async (ingredient) => {
    try {
      const response = await fetch("http://localhost:3005/api/purchase-orders", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierId: 1, // Use a valid supplier ID or get it from ingredient if available
          items: [{
            ingredientId: ingredient.id,
            quantity: ingredient.thresholdValue - ingredient.stockLevel
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate purchase order');
      }

      const data = await response.json();
      if (data.success) {
        alert(`Purchase order generated successfully for ${ingredient.Ingredient.name}`);
        fetchInventory(); // Refresh inventory
      } else {
        throw new Error(data.message || 'Failed to generate purchase order');
      }
    } catch (err) {
      console.error('Error generating PO:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header-container">
        <h2 className="inventory-header">
          <span className="gold-shimmer">📦</span> Inventory Management
        </h2>
      </div>

      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      {loading ? (
        <div className="loading-skeleton">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      ) : error ? (
        <p className="error-text">Error: {error}</p>
      ) : ingredients.length === 0 ? (
        <p className="loading-text">No ingredients available.</p>
      ) : (
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Unit</th>
                <th>Stock Level</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => (
                <tr
                  key={ing.id}
                  className={ing.status === 'Low Stock' ? "low-stock-row" : ""}
                >
                  <td>{ing.Ingredient.name}</td>
                  <td>{ing.Ingredient.unit}</td>
                  <td>{ing.stockLevel}</td>
                  <td>{ing.thresholdValue}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        ing.status === 'Low Stock' ? "low-stock-badge" : "in-stock-badge"
                      }`}
                    >
                      {ing.status}
                    </span>
                  </td>
                  <td>
                    {ing.needsReorder && (
                      <button
                        className="action-btn"
                        onClick={() => handleGeneratePO(ing)}
                      >
                        📝 Generate PO
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InventoryManagement;