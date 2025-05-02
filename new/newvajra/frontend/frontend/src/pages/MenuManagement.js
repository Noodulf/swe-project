// src/pages/MenuManagement.js
import React, { useState, useEffect } from "react";
import "../styles/common.css";
import "./MenuManagement.css";
import FoodCarousel from "../components/FoodCarousel";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3002/menu/');
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await response.json();
      setMenuItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to fetch menu items');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
  
    const itemName = newItem.name;
    const price = parseFloat(newItem.price);
  
    try {
      const response = await fetch('http://localhost:3002/menu/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemName,
          action: 'add',
          price
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item');
      }
  
      await fetchMenuItems(); // Refresh the menu items
      setNewItem({ name: "", price: "" });
      toast.success("Item added successfully! ✅");
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(error.message || "Failed to add item ❌");
    }
  };

  const handleDeleteItem = async (itemName, price) => {
    try {
      const response = await fetch('http://localhost:3002/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemName,
          action: 'delete',
          price
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      await fetchMenuItems(); // Refresh the menu items
      toast.info("Item deleted 🗑");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item ❌");
    }
  };

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-container menu-page">
      <FoodCarousel />
      <h2 className="menu-header">🍽 Menu Management</h2>
      <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>

      <form className="menu-form" onSubmit={handleAddItem}>
        <h3>Add New Item</h3>

        <label>Item Name:</label>
        <input
          name="name"
          placeholder="e.g. Veg Biryani"
          value={newItem.name}
          onChange={handleChange}
          required
        />

        <label>Price (₹):</label>
        <input
          name="price"
          type="number"
          placeholder="e.g. 199"
          value={newItem.price}
          onChange={handleChange}
          required
        />

        <button type="submit" className="add-btn">➕ Add Item</button>
      </form>

      <h3 className="menu-subheader">📋 Menu Items</h3>

      {loading ? (
        <p className="loading-text">Loading menu...</p>
      ) : menuItems.length === 0 ? (
        <p className="loading-text">No items in menu yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.menuItemName}>
                  <td>{item.menuItemName}</td>
                  <td>{item.price}</td>
                  <td>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteItem(item.menuItemName, item.price)}
                    >
                      🗑 Delete
                    </button>
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

export default MenuManagement;