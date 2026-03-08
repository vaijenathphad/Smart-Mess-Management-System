import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface PaymentRecord {
  _id: string;
  student: string;
  month: string;
  amount: number;
  status: 'paid' | 'pending';
  dueDate: string;
  paymentDate?: string;
  transactionId?: string;
}

interface BillItem {
  description: string;
  amount: number;
}

interface Bill {
  _id: string;
  student: string;
  month: string;
  items: BillItem[];
  totalAmount: number;
  status: 'paid' | 'pending';
  dueDate: string;
  createdAt: string;
}

const BillingPayment: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    transactionId: '',
    amount: '',
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch bills
      const billsResponse = await fetch('http://localhost:5000/api/bills/student', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!billsResponse.ok) {
        throw new Error('Failed to fetch bills');
      }
      const billsData = await billsResponse.json();
      setBills(Array.isArray(billsData) ? billsData : []);

      // Fetch payment records
      const paymentsResponse = await fetch('http://localhost:5000/api/payments/student', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!paymentsResponse.ok) {
        throw new Error('Failed to fetch payment records');
      }
      const paymentsData = await paymentsResponse.json();
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenPaymentDialog = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentForm({
      transactionId: '',
      amount: bill.totalAmount.toString(),
    });
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedBill(null);
    setPaymentForm({
      transactionId: '',
      amount: '',
    });
  };

  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPayment = async () => {
    if (!selectedBill) return;

    try {
      setProcessingPayment(true);
      setError('');
      setSuccess('');

      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          billId: selectedBill._id,
          amount: parseFloat(paymentForm.amount),
          transactionId: paymentForm.transactionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }

      setSuccess('Payment processed successfully!');
      handleClosePaymentDialog();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'paid' ? 'success' : 'error';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Billing & Payments
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Bills" />
          <Tab label="Payment History" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.length > 0 ? (
                bills.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell>{bill.month}</TableCell>
                    <TableCell>{formatDate(bill.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={bill.status.toUpperCase()} 
                        color={getStatusColor(bill.status) as any} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {bill.status === 'pending' && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          onClick={() => handleOpenPaymentDialog(bill)}
                        >
                          Pay Now
                        </Button>
                      )}
                      {bill.status === 'paid' && (
                        <Button 
                          variant="outlined" 
                          color="success" 
                          size="small"
                          disabled
                        >
                          Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No bills available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Transaction ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{payment.month}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.status.toUpperCase()} 
                        color={getStatusColor(payment.status) as any} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatDate(payment.dueDate)}</TableCell>
                    <TableCell>
                      {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                    </TableCell>
                    <TableCell>{payment.transactionId || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No payment records available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog}>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Bill Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Month:</Typography>
                <Typography variant="body2">{selectedBill.month}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Due Date:</Typography>
                <Typography variant="body2">{formatDate(selectedBill.dueDate)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Amount:</Typography>
                <Typography variant="body2" fontWeight="bold">{formatCurrency(selectedBill.totalAmount)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Payment Details
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="transactionId"
            name="transactionId"
            label="Transaction ID"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentForm.transactionId}
            onChange={handlePaymentFormChange}
            required
          />
          <TextField
            margin="dense"
            id="amount"
            name="amount"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={paymentForm.amount}
            onChange={handlePaymentFormChange}
            required
            disabled
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitPayment} 
            variant="contained" 
            color="primary"
            disabled={processingPayment || !paymentForm.transactionId}
          >
            {processingPayment ? <CircularProgress size={24} /> : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingPayment; 