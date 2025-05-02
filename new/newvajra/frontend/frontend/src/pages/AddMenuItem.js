// src/pages/AddMenuItem.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/common.css";

function AddMenuItem() {
  const navigate = useNavigate();
  const [item, setItem] = useState({ name: "", price: "", description: "" });

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ⏳ Mock saving (we'll replace with fetch later)
    console.log("New Item Submitted:", item);

    // Go back to Menu screen
    navigate("/menu");
  };

  return (
    <div className="page-container">

      <h2>Add Menu Item</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Item Name"
          value={item.name}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={item.price}
          onChange={handleChange}
          required
        /><br /><br />
        <textarea
          name="description"
          placeholder="Description"
          value={item.description}
          onChange={handleChange}
          required
        /><br /><br />
        <button type="submit">Add Item</button>
        <button type="button" onClick={() => navigate("/menu")} style={{ marginLeft: "1rem" }}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default AddMenuItem;
