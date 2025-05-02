// src/pages/GenerateBill.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/common.css';
import './GenerateBill.css';

function GenerateBill() {
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.tempId) {
      toast.error('No order found');
      navigate('/order-entry');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:3002/orders/${location.state.tempId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to fetch order');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [location.state?.tempId, navigate]);

  const handleGenerateBill = async () => {
    try {
      const response = await fetch('http://localhost:3002/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tempId: location.state.tempId,
          paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate bill');
      }

      const data = await response.json();
      toast.success('Bill generated successfully! 🎉');
      
      // Navigate to reports page
      navigate('/reports');
    } catch (error) {
      console.error('Error generating bill:', error);
      toast.error('Failed to generate bill ❌');
    }
  };

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  if (!order) {
    return <div className="page-container">No order found</div>;
  }

  const calculateTotal = () => {
    return order.items.reduce((total, item) => total + item.total, 0);
  };

  return (
    <div className="page-container bill-page">
      <h2>🧾 Generate Bill</h2>
      <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>

      <div className="bill-container">
        <div className="bill-header">
          <h3>Order Details</h3>
          <p>Customer: {order.customerName}</p>
          <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="bill-items">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.unitPrice}</td>
                  <td>₹{item.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3"><strong>Total Amount</strong></td>
                <td><strong>₹{calculateTotal()}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="payment-section">
          <h3>Payment Method</h3>
          <div className="payment-options">
            <label>
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash
            </label>
            <label>
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Card
            </label>
            <label>
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              UPI
            </label>
          </div>

          <button 
            className="generate-bill-btn"
            onClick={handleGenerateBill}
          >
            Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateBill;
