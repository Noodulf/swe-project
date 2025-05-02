// src/pages/GenerateBill.js
import React, { useEffect, useState } from "react";
import "../styles/common.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function GenerateBill() {
  const [order, setOrder] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [generated, setGenerated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("currentOrder"));
    if (orderData) {
      setOrder(orderData);
    }
  }, []);

  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleGenerateBill = async () => {
    if (!order.length) {
      toast.error("No order data found!");
      return;
    }

    try {
      const billPayload = {
        order_items: order.map(item => ({
          item_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        payment_method: paymentMethod
      };

      const response = await fetch("http://127.0.0.1:5000/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(billPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate bill!");
      }

      const data = await response.json();
      console.log("✅ Bill Saved Successfully:", data);

      toast.success("Bill generated and saved ✅");
      setGenerated(true);
      localStorage.removeItem("currentOrder");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error(err);
      toast.error("Error generating bill 😢");
    }
  };

  return (
    <div className="page-container">
      <h2>💸 Bill Generation</h2>
      <button onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
      <br /><br />

      {order.length === 0 ? (
        <p>No order data found.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                  <td>₹{item.price * item.quantity}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="3"><strong>Total</strong></td>
                <td><strong>₹{total}</strong></td>
              </tr>
            </tbody>
          </table>

          <br />
          <label>Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>

          <br /><br />
          <button onClick={handleGenerateBill}>🧾 Generate Bill</button>

          {generated && (
            <p style={{ color: "green", marginTop: "1rem" }}>
              ✅ Bill generated successfully!
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default GenerateBill;
