import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import AmountDisplay from '../common/AmountDisplay';

const BalanceCard = ({ balance, lastUpdated }) => {
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Current Balance
      </Typography>
      <AmountDisplay amount={balance} size="h3" />
      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
        Last updated: {new Date(lastUpdated).toLocaleString()}
      </Typography>
    </Paper>
  );
};

export default BalanceCard; 