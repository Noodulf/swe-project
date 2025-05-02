import React from 'react';
import { Box, TextField } from '@mui/material';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Start Date"
        type="date"
        value={startDate || ''}
        onChange={(e) => onStartDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="End Date"
        type="date"
        value={endDate || ''}
        onChange={(e) => onEndDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: startDate }}
      />
    </Box>
  );
};

export default DateRangePicker; 