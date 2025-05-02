// src/pages/OrderEntry.js
import React, { useState, useEffect } from 'react';
import "../styles/common.css";
import "./OrderEntry.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function OrderEntry() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3002/menu');
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

  const handleAddToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.menuItemName === item.menuItemName);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menuItemName === item.menuItemName
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success('Item added to cart! 🛒');
  };

  const handleRemoveFromCart = (itemName) => {
    setCart(cart.filter(item => item.menuItemName !== itemName));
    toast.info('Item removed from cart 🗑');
  };

  const handleQuantityChange = (itemName, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(itemName);
      return;
    }
    setCart(cart.map(item =>
      item.menuItemName === itemName
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    try {
      // Create new order
      const orderResponse = await fetch('http://localhost:3002/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName })
      });
      if (!orderResponse.ok) throw new Error('Failed to create order');
      const { tempId } = await orderResponse.json();
      console.log('Order created, tempId:', tempId);

      // Add items to order
      for (const item of cart) {
        const itemRes = await fetch(`http://localhost:3002/orders/${tempId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: item.menuItemName,
            quantity: item.quantity
          })
        });
        if (!itemRes.ok) {
          const errData = await itemRes.json();
          console.error('Failed to add item:', errData);
          throw new Error('Failed to add item to order');
        }
        console.log('Added item:', item.menuItemName);
      }
      navigate('/generate-bill', { state: { tempId } });
      toast.success('Order placed successfully! 🎉');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order ❌');
    }
  };

  const calculateTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="page-container order-page">
      <h2>🍽 Order Entry</h2>
      <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
      <div className="order-container">
        <div className="menu-section">
          <h3>Menu Items</h3>
          {loading ? (
            <p>Loading menu...</p>
          ) : (
            <div className="menu-grid">
              {menuItems.map(item => (
                <div key={item.menuItemName} className="menu-item">
                  <h4>{item.menuItemName}</h4>
                  <p>₹{item.price}</p>
                  <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="cart-section">
          <h3>🛒 Cart</h3>
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="customer-input"
            style={{ marginBottom: "16px", width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <table className="cart-table">
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
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>Cart is empty.</td>
                </tr>
              ) : (
                cart.map(item => (
                  <tr key={item.menuItemName}>
                    <td>{item.menuItemName}</td>
                    <td>
                      <button onClick={() => handleQuantityChange(item.menuItemName, item.quantity - 1)}>-</button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleQuantityChange(item.menuItemName, parseInt(e.target.value) || 1)}
                        style={{ width: "100px", textAlign: "center", margin: "0 4px" }}
                      />
                      <button onClick={() => handleQuantityChange(item.menuItemName, item.quantity + 1)}>+</button>
                    </td>
                    <td>₹{item.price}</td>
                    <td>₹{item.price * item.quantity}</td>
                    <td>
                      <button className="remove-btn" onClick={() => handleRemoveFromCart(item.menuItemName)}>🗑</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: "right" }}><strong>Total</strong></td>
                <td colSpan={2}><strong>₹{calculateTotal()}</strong></td>
              </tr>
            </tfoot>
          </table>
          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
          >
            ✅ Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderEntry;
