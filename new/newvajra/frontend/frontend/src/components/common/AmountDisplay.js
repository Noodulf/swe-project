import React from 'react';
import { Typography } from '@mui/material';

const AmountDisplay = ({ amount, size = 'body1' }) => {
  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Typography variant={size} component="span">
      {formatAmount(amount)}
    </Typography>
  );
};

export default AmountDisplay; 