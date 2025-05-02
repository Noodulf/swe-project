// src/pages/OrderEntry.js
import React, { useEffect, useState } from "react";
import "../styles/common.css";
import "./OrderEntry.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function OrderEntry() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/menu/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
      })
      .catch((err) => {
        console.error("Failed to fetch menu:", err);
        toast.error("Failed to load menu ❌");
      });
  }, []);

  const handleAddToCart = (item, quantity) => {
    if (!quantity || quantity <= 0) return;

    setCart((prev) => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + parseInt(quantity),
      },
    }));

    toast.success(`${item.name} added to cart ✅`);
  };

  const handleChangeQty = (itemId, qty) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: parseInt(qty),
      },
    }));
  };

  const handleRemoveItem = (itemId) => {
    const updated = { ...cart };
    delete updated[itemId];
    setCart(updated);
  };

  const handleSubmitOrder = () => {
    const cartArray = Object.values(cart);
    if (cartArray.length === 0) {
      toast.warn("Cart is empty!");
      return;
    }

    fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: cartArray }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Order submission failed");
        return res.json();
      })
      .then((data) => {
        toast.success("Order placed successfully ✅");
        navigate("/generate-bill");
      })
      .catch((err) => {
        console.error("Order submission error:", err);
        toast.error("Failed to place order ❌");
      });
  };

  const total = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="page-container order-entry">
      <h2 className="order-header">🧾 Order Entry</h2>
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="order-grid">
        {/* Menu Section */}
        <div className="menu-panel">
          <h3>📋 Menu</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price (₹)</th>
                <th>Qty</th>
                <th>Add</th>
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>   {/* change to menuItemName */}
                  <td>₹{item.price}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      id={`qty-${item.id}`}
                      placeholder="Qty"
                      className="qty-input"
                    />
                  </td>
                  <td>
                    <button
                      className="add-btn"
                      onClick={() =>
                        handleAddToCart(
                          item,
                          document.getElementById(`qty-${item.id}`).value
                        )
                      }
                    >
                      ➕ Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cart Section */}
        <div className="cart-panel">
          <h3>🛒 Cart</h3>
          {Object.keys(cart).length === 0 ? (
            <p className="empty-cart">Cart is empty.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(cart).map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          className="qty-input"
                          onChange={(e) =>
                            handleChangeQty(item.id, e.target.value)
                          }
                        />
                      </td>
                      <td>₹{item.price}</td>
                      <td>₹{item.price * item.quantity}</td>
                      <td>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3">
                      <strong>Total</strong>
                    </td>
                    <td colSpan="2">
                      <strong>₹{total}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              <button className="place-order-btn" onClick={handleSubmitOrder}>
                ✅ Place Order
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cute Footer 🍽️ */}
      <img
        src="/images/footer-food.jpg"
        alt="Decorative Footer"
        className="footer-image"
      />
    </div>
  );
}

export default OrderEntry;
