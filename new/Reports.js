// src/pages/Reports.js
import React, { useState } from "react";
import "../styles/common.css";
import "./Reports.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Reports() {
  const [reportType, setReportType] = useState("sales");
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/reports/${reportType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dateRange),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch report!");
      }

      const data = await response.json();
      setReportData(data); // Assume backend returns correct structure
      toast.success("Report generated ✅");
    } catch (err) {
      console.error(err);
      setError("Failed to generate report 😢");
      toast.error("Error generating report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container reports-page">
      <h2 className="report-header">📊 Reports</h2>
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="report-controls">
        <label>Report Type:</label>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="sales">Sales Report</option>
          <option value="inventory">Inventory Report</option>
          <option value="financial">Financial Report</option>
        </select>

        <label>From:</label>
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
        />
        <label>To:</label>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
        />

        <button className="generate-btn" onClick={generateReport} disabled={loading}>
          📥 {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      {reportData && (
        <div className="report-table-wrapper">
          <h3 className="report-subheader">
            📄 {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
          </h3>

          {reportType === "sales" && (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity Sold</th>
                  <th>Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.item}</td>
                    <td>{row.qty}</td>
                    <td>₹{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "inventory" && (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Used Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.ingredient}</td>
                    <td>{row.used}</td>
                    <td>{row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "financial" && (
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Total Revenue</strong></td>
                  <td>₹{reportData.revenue}</td>
                </tr>
                <tr>
                  <td><strong>Total Expenses</strong></td>
                  <td>₹{reportData.expenses}</td>
                </tr>
                <tr>
                  <td><strong>Profit</strong></td>
                  <td>₹{reportData.profit}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      <img
        src="/images/reports-generation.png"
        alt="Footer Decoration"
        className="footer-image"
      />
    </div>
  );
}

export default Reports;
