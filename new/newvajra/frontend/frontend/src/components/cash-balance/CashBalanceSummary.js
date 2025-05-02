import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper
} from '@mui/material';
import { toast } from 'react-toastify';
import BalanceCard from './BalanceCard';
import BalanceHistoryChart from './BalanceHistoryChart';
import TransactionList from './TransactionList';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { BASE_URL, getAuthHeaders, formatCurrency, formatDate } from '../../config/api';

const CashBalanceSummary = () => {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current balance
      const balanceResponse = await fetch(`${BASE_URL}/cash-balance`, {
        headers: getAuthHeaders()
      });
      if (!balanceResponse.ok) {
        const errorData = await balanceResponse.json();
        throw new Error(errorData.message || 'Failed to fetch balance');
      }
      const balanceData = await balanceResponse.json();
      setBalance(balanceData.balance);

      // Fetch balance history
      const historyResponse = await fetch(`${BASE_URL}/cash-balance/history`, {
        headers: getAuthHeaders()
      });
      if (!historyResponse.ok) {
        const errorData = await historyResponse.json();
        throw new Error(errorData.message || 'Failed to fetch history');
      }
      const historyData = await historyResponse.json();
      setHistory(historyData.balances);

      // Fetch transactions
      const transactionsResponse = await fetch(`${BASE_URL}/cash-balance/transactions`, {
        headers: getAuthHeaders()
      });
      if (!transactionsResponse.ok) {
        const errorData = await transactionsResponse.json();
        throw new Error(errorData.message || 'Failed to fetch transactions');
      }
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData.transactions);
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Failed to fetch cash balance data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch(`${BASE_URL}/cash-balance/export`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export report');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cash-balance-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to export report');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cash Balance
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <BalanceCard
            balance={balance}
            lastUpdated={history[0]?.last_updated}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <BalanceHistoryChart data={history} />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Transaction History</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExportReport}
              >
                Export Report
              </Button>
            </Box>
            <TransactionList transactions={transactions} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CashBalanceSummary; 