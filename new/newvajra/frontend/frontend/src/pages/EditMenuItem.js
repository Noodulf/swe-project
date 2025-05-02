// src/pages/EditMenuItem.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/common.css";

function EditMenuItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({ name: "", price: "", description: "" });

  useEffect(() => {
    // Mock: fetch item by ID
    const mockData = [
      { id: 1, name: "Mock Pizza", price: 299, description: "Fake but tasty 🍕" },
      { id: 2, name: "Fake Pasta", price: 249, description: "Imaginary Italian 🇮🇹" }
    ];
    const found = mockData.find(i => i.id === parseInt(id));
    if (found) {
      setItem(found);
    } else {
      alert("Item not found!");
      navigate("/menu");
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated item:", item); // later send to backend
    navigate("/menu");
  };

  return (
    <div className="page-container">

      <h2>Edit Menu Item</h2>
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
        <button type="submit">Save Changes</button>
        <button type="button" onClick={() => navigate("/menu")} style={{ marginLeft: "1rem" }}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditMenuItem;
