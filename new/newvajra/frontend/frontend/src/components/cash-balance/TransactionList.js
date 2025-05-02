import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import AmountDisplay from '../common/AmountDisplay';

const TransactionList = ({ transactions }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Running Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {new Date(transaction.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>
                <AmountDisplay amount={transaction.amount} />
              </TableCell>
              <TableCell>
                <AmountDisplay amount={transaction.runningBalance} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionList; 