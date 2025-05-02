import React, { useEffect, useState } from "react";
import "../styles/common.css";
import "./PurchaseOrders.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/purchase-orders");
      if (!response.ok) {
        throw new Error('Failed to fetch purchase orders');
      }
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch purchase orders');
      }
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      setError(err.message);
      toast.error("Failed to load purchase orders ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/purchase-orders/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve purchase order');
      }

      const data = await response.json();
      if (data.success) {
        // Check inventory status after approval
        const debugResponse = await fetch(`http://localhost:3000/api/purchase-orders/${id}/debug`);
        const debugData = await debugResponse.json();
        
        if (debugData.success) {
          const inventoryUpdates = debugData.data.inventoryStatus.map(item => 
            `${item.ingredientName}: ${item.currentInventory} units`
          ).join(', ');
          
          toast.success(`Order approved ✅\nInventory updated: ${inventoryUpdates}`);
        } else {
          toast.success("Order approved ✅");
        }
        
        fetchPurchaseOrders(); // Refresh orders
      } else {
        throw new Error(data.message || 'Failed to approve purchase order');
      }
    } catch (err) {
      console.error('Error approving order:', err);
      toast.error("Approval failed ❌");
    }
  };

  return (
    <div className="page-container po-page">
      <h2 className="po-header">📦 Purchase Orders</h2>
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      {loading ? (
        <p className="loading-text">Loading purchase orders...</p>
      ) : error ? (
        <p className="error-text">Error: {error}</p>
      ) : orders.length === 0 ? (
        <p className="loading-text">No purchase orders available.</p>
      ) : (
        <div className="table-wrapper">
          <table className="po-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <React.Fragment key={po.id}>
                  {po.items && po.items.map((item, index) => (
                    <tr key={`${po.id}-${index}`}>
                      <td>{item.ingredient}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            po.status === 'approved' ? "approved" : "pending"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td>
                        {po.status === 'pending' ? (
                          <button
                            className="approve-btn"
                            onClick={() => handleApprove(po.id)}
                          >
                            ✅ Approve
                          </button>
                        ) : (
                          <span style={{ color: "green", fontWeight: "bold" }}>
                            ✔️
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrders;