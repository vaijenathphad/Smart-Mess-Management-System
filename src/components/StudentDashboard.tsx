import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

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

interface MenuItem {
  item: string;
  time: string;
}

interface Menu {
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent';
}

interface PaymentRecord {
  month: string;
  amount: number;
  status: 'paid' | 'pending';
  dueDate: string;
}

interface Bill {
  _id: string;
  month: string;
  items: {
    description: string;
    amount: number;
  }[];
  totalAmount: number;
  status: 'paid' | 'pending';
  dueDate: string;
}

interface Payment {
  _id: string;
  month: string;
  amount: number;
  status: 'paid' | 'pending';
  dueDate: string;
  paymentDate?: string;
  transactionId?: string;
}

const StudentDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    transactionId: '',
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch attendance
      const attendanceResponse = await fetch('http://localhost:5000/api/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!attendanceResponse.ok) {
        throw new Error('Failed to fetch attendance');
      }
      const attendanceData = await attendanceResponse.json();
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);

      // Fetch menu
      const menuResponse = await fetch('http://localhost:5000/api/menu/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!menuResponse.ok) {
        throw new Error('Failed to fetch menu');
      }
      const menuData = await menuResponse.json();
      setMenu(menuData || { breakfast: [], lunch: [], dinner: [] });

      // Fetch bills
      const billsResponse = await fetch('http://localhost:5000/api/bills/student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!billsResponse.ok) {
        throw new Error('Failed to fetch bills');
      }
      const billsData = await billsResponse.json();
      setBills(Array.isArray(billsData) ? billsData : []);

      // Fetch payments
      const paymentsResponse = await fetch('http://localhost:5000/api/payments/student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!paymentsResponse.ok) {
        throw new Error('Failed to fetch payments');
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
      amount: bill.totalAmount.toString(),
      transactionId: '',
    });
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedBill(null);
    setPaymentForm({
      amount: '',
      transactionId: '',
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

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

      handleClosePaymentDialog();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
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
        Student Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Today's Menu" />
          <Tab label="My Attendance" />
          <Tab label="Payment Status" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {menu && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', maxWidth: '100%' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Breakfast
                    </Typography>
                    {menu.breakfast && menu.breakfast.length > 0 ? (
                      menu.breakfast.map((item, index) => (
                        <Typography key={index} variant="body1">
                          {item.item} ({item.time})
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body1">
                        No breakfast menu available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 300px', maxWidth: '100%' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Lunch
                    </Typography>
                    {menu.lunch && menu.lunch.length > 0 ? (
                      menu.lunch.map((item, index) => (
                        <Typography key={index} variant="body1">
                          {item.item} ({item.time})
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body1">
                        No lunch menu available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 300px', maxWidth: '100%' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Dinner
                    </Typography>
                    {menu.dinner && menu.dinner.length > 0 ? (
                      menu.dinner.map((item, index) => (
                        <Typography key={index} variant="body1">
                          {item.item} ({item.time})
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body1">
                        No dinner menu available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(attendance) && attendance.length > 0 ? (
                attendance.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No attendance records available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(payments) && payments.length > 0 ? (
                payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.month}</TableCell>
                    <TableCell>₹{payment.amount}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No payment records available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Bills Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Bills
        </Typography>
        <TableContainer>
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
                        color={bill.status === 'paid' ? 'success' : 'error'} 
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
      </Paper>

      {/* Payment History Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Payment History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Amount</TableCell>
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
                      {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                    </TableCell>
                    <TableCell>{payment.transactionId || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No payment history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog}>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <TextField
                fullWidth
                margin="normal"
                id="amount"
                name="amount"
                label="Amount"
                type="number"
                value={paymentForm.amount}
                onChange={handlePaymentFormChange}
                required
                disabled
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                margin="normal"
                id="transactionId"
                name="transactionId"
                label="Transaction ID"
                type="text"
                value={paymentForm.transactionId}
                onChange={handlePaymentFormChange}
                required
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitPayment} 
            variant="contained" 
            color="primary"
            disabled={processingPayment || !paymentForm.transactionId}
          >
            {processingPayment ? <CircularProgress size={24} /> : 'Pay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard; 