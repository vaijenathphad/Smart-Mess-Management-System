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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

interface Student {
  _id: string;
  name: string;
  studentId: string;
  roomNumber: string;
}

interface PaymentRecord {
  _id: string;
  student: string;
  studentName?: string;
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
  studentName?: string;
  month: string;
  items: BillItem[];
  totalAmount: number;
  status: 'paid' | 'pending';
  dueDate: string;
  createdAt: string;
}

const AdminBilling: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Bill Dialog States
  const [openBillDialog, setOpenBillDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billForm, setBillForm] = useState({
    student: '',
    month: '',
    dueDate: '',
    items: [{ description: '', amount: 0 }],
  });
  const [processingBill, setProcessingBill] = useState(false);
  
  // Payment Dialog States
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    billId: '',
    student: '',
    amount: '',
    transactionId: '',
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch students
      const studentsResponse = await fetch('http://localhost:5000/api/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }
      const studentsData = await studentsResponse.json();
      setStudents(Array.isArray(studentsData) ? studentsData : []);

      // Fetch all bills
      const billsResponse = await fetch('http://localhost:5000/api/bills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!billsResponse.ok) {
        throw new Error('Failed to fetch bills');
      }
      const billsData = await billsResponse.json();
      setBills(Array.isArray(billsData) ? billsData : []);

      // Fetch all payments
      const paymentsResponse = await fetch('http://localhost:5000/api/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  // Bill Dialog Handlers
  const handleOpenBillDialog = (bill?: Bill) => {
    if (bill) {
      setSelectedBill(bill);
      setBillForm({
        student: bill.student,
        month: bill.month,
        dueDate: bill.dueDate.split('T')[0],
        items: bill.items,
      });
    } else {
      setSelectedBill(null);
      setBillForm({
        student: '',
        month: '',
        dueDate: '',
        items: [{ description: '', amount: 0 }],
      });
    }
    setOpenBillDialog(true);
  };

  const handleCloseBillDialog = () => {
    setOpenBillDialog(false);
    setSelectedBill(null);
    setBillForm({
      student: '',
      month: '',
      dueDate: '',
      items: [{ description: '', amount: 0 }],
    });
  };

  const handleBillFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setBillForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddBillItem = () => {
    setBillForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: 0 }]
    }));
  };

  const handleRemoveBillItem = (index: number) => {
    setBillForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleBillItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    setBillForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleSubmitBill = async () => {
    try {
      setProcessingBill(true);
      setError('');
      setSuccess('');

      const totalAmount = billForm.items.reduce((sum, item) => sum + Number(item.amount), 0);
      
      const billData = {
        student: billForm.student,
        month: billForm.month,
        dueDate: billForm.dueDate,
        items: billForm.items,
        totalAmount,
      };

      const url = selectedBill 
        ? `http://localhost:5000/api/bills/${selectedBill._id}`
        : 'http://localhost:5000/api/bills';
      
      const method = selectedBill ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save bill');
      }

      setSuccess(selectedBill ? 'Bill updated successfully!' : 'Bill created successfully!');
      handleCloseBillDialog();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Bill error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save bill');
    } finally {
      setProcessingBill(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const response = await fetch(`http://localhost:5000/api/bills/${billId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete bill');
      }

      setSuccess('Bill deleted successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete bill');
    }
  };

  // Payment Dialog Handlers
  const handleOpenPaymentDialog = (payment?: PaymentRecord) => {
    if (payment) {
      setSelectedPayment(payment);
      setPaymentForm({
        billId: payment._id,
        student: payment.student,
        amount: payment.amount.toString(),
        transactionId: payment.transactionId || '',
      });
    } else {
      setSelectedPayment(null);
      setPaymentForm({
        billId: '',
        student: '',
        amount: '',
        transactionId: '',
      });
    }
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedPayment(null);
    setPaymentForm({
      billId: '',
      student: '',
      amount: '',
      transactionId: '',
    });
  };

  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setPaymentForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitPayment = async () => {
    try {
      setProcessingPayment(true);
      setError('');
      setSuccess('');

      const paymentData = {
        billId: paymentForm.billId,
        student: paymentForm.student,
        amount: parseFloat(paymentForm.amount),
        transactionId: paymentForm.transactionId,
      };

      const url = selectedPayment 
        ? `http://localhost:5000/api/payments/${selectedPayment._id}`
        : 'http://localhost:5000/api/payments';
      
      const method = selectedPayment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save payment');
      }

      setSuccess(selectedPayment ? 'Payment updated successfully!' : 'Payment recorded successfully!');
      handleClosePaymentDialog();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const response = await fetch(`http://localhost:5000/api/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete payment');
      }

      setSuccess('Payment deleted successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete payment');
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
        Billing & Payment Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Bills" />
          <Tab label="Payments" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenBillDialog()}
          >
            Generate New Bill
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
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
                    <TableCell>{bill.studentName || 'Unknown Student'}</TableCell>
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
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleOpenBillDialog(bill)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenBillDialog(bill)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteBill(bill._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No bills available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenPaymentDialog()}
          >
            Record Payment
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Month</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{payment.studentName || 'Unknown Student'}</TableCell>
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
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenPaymentDialog(payment)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeletePayment(payment._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No payment records available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Bill Dialog */}
      <Dialog 
        open={openBillDialog} 
        onClose={handleCloseBillDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedBill ? 'Edit Bill' : 'Generate New Bill'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="student-label">Student</InputLabel>
                  <Select
                    labelId="student-label"
                    id="student"
                    name="student"
                    value={billForm.student}
                    onChange={(e) => handleBillFormChange({ target: { name: 'student', value: e.target.value } } as any)}
                    label="Student"
                    required
                  >
                    {students.map((student) => (
                      <MenuItem key={student._id} value={student._id}>
                        {student.name} ({student.studentId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  id="month"
                  name="month"
                  label="Month"
                  type="text"
                  value={billForm.month}
                  onChange={handleBillFormChange}
                  required
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  id="dueDate"
                  name="dueDate"
                  label="Due Date"
                  type="date"
                  value={billForm.dueDate}
                  onChange={handleBillFormChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Bill Items
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {billForm.items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={item.description}
                  onChange={(e) => handleBillItemChange(index, 'description', e.target.value)}
                  required
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleBillItemChange(index, 'amount', parseFloat(e.target.value) || 0)}
                  required
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {index > 0 && (
                  <Button 
                    color="error" 
                    onClick={() => handleRemoveBillItem(index)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>
          ))}

          <Button 
            startIcon={<AddIcon />} 
            onClick={handleAddBillItem}
            sx={{ mt: 1 }}
          >
            Add Item
          </Button>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle1">
              Total Amount: {formatCurrency(billForm.items.reduce((sum, item) => sum + Number(item.amount), 0))}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBillDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitBill} 
            variant="contained" 
            color="primary"
            disabled={processingBill || !billForm.student || !billForm.month || !billForm.dueDate}
          >
            {processingBill ? <CircularProgress size={24} /> : (selectedBill ? 'Update' : 'Generate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog}>
        <DialogTitle>
          {selectedPayment ? 'Edit Payment' : 'Record Payment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel id="student-payment-label">Student</InputLabel>
                <Select
                  labelId="student-payment-label"
                  id="student"
                  name="student"
                  value={paymentForm.student}
                  onChange={(e) => handlePaymentFormChange({ target: { name: 'student', value: e.target.value } } as any)}
                  label="Student"
                  required
                >
                  {students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.name} ({student.studentId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel id="bill-label">Bill</InputLabel>
                <Select
                  labelId="bill-label"
                  id="billId"
                  name="billId"
                  value={paymentForm.billId}
                  onChange={(e) => handlePaymentFormChange({ target: { name: 'billId', value: e.target.value } } as any)}
                  label="Bill"
                  required
                >
                  {bills
                    .filter(bill => bill.student === paymentForm.student && bill.status === 'pending')
                    .map((bill) => (
                      <MenuItem key={bill._id} value={bill._id}>
                        {bill.month} - {formatCurrency(bill.totalAmount)}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
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
            disabled={processingPayment || !paymentForm.student || !paymentForm.billId || !paymentForm.amount || !paymentForm.transactionId}
          >
            {processingPayment ? <CircularProgress size={24} /> : (selectedPayment ? 'Update' : 'Record')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBilling; 