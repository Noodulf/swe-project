import React, { useEffect, useState } from "react";
import "../styles/common.css";
import "./CashBalance.css"; // create this
import { useNavigate } from "react-router-dom";

function CashBalance() {
  const [cashData, setCashData] = useState({ balance: 0, invoices: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/cash-balance") // adjust URL if needed
      .then((res) => res.json())
      .then((data) => {
        setCashData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch cash balance", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container cash-page">
      <h2 className="cash-header">💰 Current Cash Balance</h2>
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="cash-summary">
            <h3>Available Balance: ₹{cashData.balance}</h3>
          </div>

          <h3 className="invoice-heading">🧾 Invoice History</h3>
          <table className="cash-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Status</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {cashData.invoices.map((inv, index) => (
                <tr key={index}>
                  <td>{inv.invoice_no}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        inv.status === "paid" ? "paid" : "unpaid"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td>{inv.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default CashBalance;
