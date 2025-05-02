import React from 'react';
import { Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const GenerateInvoiceButton = ({ onClick, disabled }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={onClick}
      disabled={disabled}
      sx={{ mb: 2 }}
    >
      Generate Invoice
    </Button>
  );
};

export default GenerateInvoiceButton; 