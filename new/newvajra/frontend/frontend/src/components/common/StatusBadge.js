import React from 'react';
import { Badge } from '@mui/material';

const StatusBadge = ({ status }) => {
  const getColor = () => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'unpaid':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Badge
      color={getColor()}
      variant="contained"
      sx={{
        padding: '4px 8px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        fontSize: '0.75rem',
        fontWeight: 'bold'
      }}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge; 