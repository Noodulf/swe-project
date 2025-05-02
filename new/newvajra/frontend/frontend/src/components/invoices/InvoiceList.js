import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchCashBalance();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3000/api/invoices');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invoices');
      }
      const data = await response.json();
      setInvoices(data.invoices || data.data || []);
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchCashBalance = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cash-balance');
      if (!response.ok) throw new Error('Failed to fetch cash balance');
      const data = await response.json();
      setCashBalance(data.balance);
    } catch (err) {
      toast.error('Failed to fetch cash balance');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Invoice Management</h2>
      <div style={{ marginBottom: 16, fontWeight: 'bold' }}>
        Current Cash Balance: ₹{cashBalance}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5e9c9' }}>
            <th>Invoice Number</th>
            <th>PO Number</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Cheque Details</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center' }}>No invoices found.</td></tr>
          ) : (
            invoices.map((inv, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? '#fffbe6' : '#fff' }}>
                <td>{inv.invoice_number}</td>
                <td>{inv.purchase_order_id}</td>
                <td>₹{Number(inv.amount).toFixed(2)}</td>
                <td style={{ fontWeight: inv.status === 'paid' ? 'bold' : 'normal', color: inv.status === 'paid' ? 'green' : 'orange' }}>{inv.status.toUpperCase()}</td>
                <td>
                  {inv.status === 'paid' && inv.cheque_number ? (
                    <>
                      Cheque: {inv.cheque_number}<br />
                      Date: {inv.cheque_date ? new Date(inv.cheque_date).toLocaleString() : ''}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList; 