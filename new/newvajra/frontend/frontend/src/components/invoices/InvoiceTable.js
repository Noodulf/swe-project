import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Tooltip
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import StatusBadge from '../common/StatusBadge';
import AmountDisplay from '../common/AmountDisplay';
import { formatDate } from '../../config/api';

const InvoiceTable = ({ invoices, onPrintCheque }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Invoice Number</TableCell>
            <TableCell>PO Number</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Cheque Details</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.PurchaseOrder?.po_number}</TableCell>
              <TableCell>{invoice.PurchaseOrder?.supplier_name}</TableCell>
              <TableCell>
                <AmountDisplay amount={invoice.amount} />
              </TableCell>
              <TableCell>
                <StatusBadge status={invoice.status} />
              </TableCell>
              <TableCell>
                {invoice.status === 'paid' ? (
                  <Box>
                    <div>Cheque: {invoice.cheque_number}</div>
                    <div>Date: {formatDate(invoice.cheque_date)}</div>
                  </Box>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {invoice.status === 'unpaid' && (
                    <Tooltip title="Print Cheque">
                      <IconButton
                        onClick={() => onPrintCheque(invoice.id)}
                        color="primary"
                        size="small"
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvoiceTable; 