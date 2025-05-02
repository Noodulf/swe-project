// src/pages/Reports.js
import React, { useState, useEffect } from 'react';
import "../styles/common.css";
import "./Reports.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Reports() {
  const [reports, setReports] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchReports = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3002/reports?from=${dateRange.from}&to=${dateRange.to}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="reports-page">
      <div className="reports-container">
        <h1 className="report-header">📊 Reports</h1>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        <div className="report-controls">
          <label>Sales Report</label>
          {/* <select value="sales" disabled>
            <option value="sales">Sales Report</option>
          </select> */}
          <label>From:</label>
          <input
            type="date"
            name="from"
            value={dateRange.from}
            onChange={handleDateChange}
          />
          <label>To:</label>
          <input
            type="date"
            name="to"
            value={dateRange.to}
            onChange={handleDateChange}
          />
          <button className="generate-btn" onClick={fetchReports} disabled={loading}>
            📥 {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {reports && (
          <div className="report-table-wrapper">
            <h3 className="report-subheader">📄 Sales Report</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.bills.map((bill, idx) => (
                  <tr key={idx}>
                    <td>{bill.customerName}</td>
                    <td>
                      {bill.items && bill.items.length > 0
                        ? bill.items.map((item, i) => (
                            <div key={i}>
                              {item.name} x {item.quantity}
                            </div>
                          ))
                        : "-"}
                    </td>
                    <td>₹{bill.totalAmount}</td>
                    <td>{new Date(bill.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2"><strong>Total Orders: {reports.totalOrders}</strong></td>
                  <td colSpan="2"><strong>Total Revenue: ₹{reports.totalRevenue}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
