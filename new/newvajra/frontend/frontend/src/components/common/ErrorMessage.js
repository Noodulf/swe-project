import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>Error</AlertTitle>
      {error.message || 'An unexpected error occurred. Please try again.'}
    </Alert>
  );
};

export default ErrorMessage; 