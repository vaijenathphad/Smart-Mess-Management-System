import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Badge,
  Card,
  CardContent,
  CardActions,
  Grid,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  alpha,
  InputAdornment,
  Fade,
  Zoom,
  Grow,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon,
  AccountCircle as AccountCircleIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  phoneNumber?: string;
}

interface Bill {
  _id: string;
  student: Student;
  month: string;
  totalAmount: number;
  status: 'pending' | 'paid';
  dueDate: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'both';
  recipients: Student[];
  status: 'pending' | 'sent' | 'failed';
  scheduledFor?: string;
  createdAt: string;
  emailSubject?: string;
  smsMessage?: string;
}

interface NotificationFormData {
  title: string;
  message: string;
  type: string;
  scheduledFor: string;
  emailSubject: string;
  smsMessage: string;
}

interface NotificationData {
  title: string;
  message: string;
  type: string;
  recipients: string[];
  scheduledFor: string | null;
  emailSubject?: string;
  smsMessage?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

const NotificationsManager: React.FC = () => {
  const { token, user } = useAuth();
  const theme = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [sendingNotification, setSendingNotification] = useState<boolean>(false);
  const [notificationForm, setNotificationForm] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'email',
    scheduledFor: '',
    emailSubject: '',
    smsMessage: '',
  });
  const [isScheduled, setIsScheduled] = useState(false);
  const [sendingOTP, setSendingOTP] = useState<boolean>(false);
  const [otpStudentId, setOtpStudentId] = useState<string | null>(null);
  const [showStudentSelector, setShowStudentSelector] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [recipientTab, setRecipientTab] = useState<number>(0);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  useEffect(() => {
    if (userSearchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(userSearchTerm))
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, users]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch students with pending bills
      const studentsResponse = await fetch('http://localhost:5000/api/students/pending-bills', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }
      const studentsData = await studentsResponse.json();
      setStudents(studentsData);
      setFilteredStudents(studentsData);

      // Fetch pending bills
      const billsResponse = await fetch('http://localhost:5000/api/bills/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!billsResponse.ok) {
        throw new Error('Failed to fetch pending bills');
      }
      const billsData = await billsResponse.json();
      setPendingBills(billsData);

      // Fetch notifications
      const notificationsResponse = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!notificationsResponse.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const notificationsData = await notificationsResponse.json();
      setNotifications(notificationsData);

      // Fetch registered users
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }
      const usersData = await usersResponse.json();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setShowStudentSelector(false);
    setRecipientTab(0);
    setActiveStep(0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShowStudentSelector(false);
    setSelectedStudents([]);
    setSelectedUsers([]);
    setActiveStep(0);
    setNotificationForm({
      title: '',
      message: '',
      type: 'email',
      scheduledFor: '',
      emailSubject: '',
      smsMessage: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNotificationForm(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student._id));
    }
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Immediately filter students based on search term
    if (e.target.value.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        student.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchTerm(e.target.value);
    // Immediately filter users based on search term
    if (e.target.value.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        user.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(e.target.value))
      );
      setFilteredUsers(filtered);
    }
  };

  const handleShowStudentSelector = () => {
    setShowStudentSelector(true);
    setSearchTerm('');
    setUserSearchTerm('');
    setFilteredStudents(students);
    setFilteredUsers(users);
  };

  const handleBackToForm = () => {
    setShowStudentSelector(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setRecipientTab(newValue);
  };

  const handleSendNotification = async () => {
    try {
      setSendingNotification(true);
      setError(null);

      // Validate form based on notification type
      if (notificationForm.type === 'email' && !notificationForm.emailSubject) {
        setError('Email subject is required');
        setSendingNotification(false);
        return;
      }

      if (notificationForm.type === 'sms' && !notificationForm.smsMessage) {
        setError('SMS message is required');
        setSendingNotification(false);
        return;
      }

      if (notificationForm.type === 'both' && (!notificationForm.emailSubject || !notificationForm.smsMessage)) {
        setError('Both email subject and SMS message are required');
        setSendingNotification(false);
        return;
      }

      // Validate that at least one recipient is selected
      const totalRecipients = selectedStudents.length + selectedUsers.length;
      if (totalRecipients === 0) {
        setError('Please select at least one recipient');
        setSendingNotification(false);
        return;
      }

      // Validate required fields
      if (!notificationForm.title || !notificationForm.message) {
        setError('Title and message are required');
        setSendingNotification(false);
        return;
      }

      // Prepare the notification data
      const notificationData: NotificationData = {
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        recipients: [...selectedStudents, ...selectedUsers],
        scheduledFor: notificationForm.scheduledFor || null,
      };

      // Add type-specific fields
      if (notificationForm.type === 'email' || notificationForm.type === 'both') {
        notificationData.emailSubject = notificationForm.emailSubject;
      }

      if (notificationForm.type === 'sms' || notificationForm.type === 'both') {
        notificationData.smsMessage = notificationForm.smsMessage;
      }

      console.log('Sending notification:', notificationData);

      const response = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send notification');
      }

      setSuccess('Notification sent successfully');
      handleCloseDialog();
      fetchData();
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to send notification. Please try again.');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setSuccess('Notification deleted successfully');
      fetchData();
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <AccessTimeIcon color="warning" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon color="info" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EmailIcon color="primary" />;
      case 'sms':
        return <PhoneIcon color="secondary" />;
      case 'both':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmailIcon color="primary" sx={{ mr: 0.5 }} />
            <PhoneIcon color="secondary" />
          </Box>
        );
      default:
        return <MessageIcon />;
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
          borderRadius: 2,
          p: 4,
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.05)} 100%)`,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <NotificationsIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Notifications & Reminders
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            Send Notification
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              boxShadow: 1,
            }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setError(null)}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              boxShadow: 1,
            }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setSuccess(null)}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {success}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3, 
          mb: 3 
        }}>
          <Box sx={{ flex: 1 }}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SchoolIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" component="div">
                    Students
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold" color="primary">
                  {students.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total registered students
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PaymentIcon color="warning" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" component="div">
                    Pending Bills
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold" color="warning.main">
                  {pendingBills.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bills awaiting payment
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <MessageIcon color="success" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" component="div">
                    Notifications
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold" color="success.main">
                  {notifications.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total notifications sent
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>SMS Message</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Recipients</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Scheduled For</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow 
                    key={notification._id}
                    hover
                    sx={{ 
                      '&:nth-of-type(odd)': { 
                        backgroundColor: alpha(theme.palette.action.hover, 0.05) 
                      },
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>
                      <Tooltip title={notification.message}>
                        <Typography noWrap sx={{ maxWidth: 150 }}>
                          {notification.message}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getTypeIcon(notification.type)}
                        <Chip
                          label={notification.type}
                          color={notification.type === 'email' ? 'primary' : 'secondary'}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={notification.emailSubject || '-'}>
                        <Typography noWrap sx={{ maxWidth: 150 }}>
                          {notification.emailSubject || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={notification.smsMessage || '-'}>
                        <Typography noWrap sx={{ maxWidth: 150 }}>
                          {notification.smsMessage || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={notification.recipients.length} color="primary">
                        <GroupIcon color="action" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getStatusIcon(notification.status)}
                        <Chip
                          label={notification.status}
                          color={
                            notification.status === 'sent'
                              ? 'success'
                              : notification.status === 'failed'
                              ? 'error'
                              : 'warning'
                          }
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {notification.scheduledFor
                        ? (
                          <Box display="flex" alignItems="center">
                            <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            {formatDate(notification.scheduledFor)}
                          </Box>
                        )
                        : 'Immediate'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        {formatDate(notification.createdAt)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteNotification(notification._id)}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: alpha(theme.palette.error.main, 0.1) 
                            } 
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 8,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          pb: 2,
        }}>
          <Box display="flex" alignItems="center">
            {showStudentSelector ? (
              <>
                <ArrowBackIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Select Recipients</Typography>
              </>
            ) : (
              <>
                <MessageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Send Notification</Typography>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {sendingNotification && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              bgcolor: alpha(theme.palette.background.paper, 0.7), 
              zIndex: 1,
              borderRadius: 2,
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Sending notification...
                </Typography>
              </Box>
            </Box>
          )}
          
          {!showStudentSelector ? (
            <Box sx={{ mt: 2 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                  <StepLabel>Notification Details</StepLabel>
                  <StepContent>
                    <TextField
                      fullWidth
                      label="Title"
                      name="title"
                      value={notificationForm.title}
                      onChange={handleFormChange}
                      margin="normal"
                      required
                      disabled={sendingNotification}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={notificationForm.message}
                      onChange={handleFormChange}
                      margin="normal"
                      multiline
                      rows={4}
                      required
                      disabled={sendingNotification}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                      <InputLabel>Notification Type</InputLabel>
                      <Select
                        name="type"
                        value={notificationForm.type}
                        onChange={handleFormChange}
                        label="Notification Type"
                        disabled={sendingNotification}
                        variant="outlined"
                      >
                        <MenuItem value="email">
                          <Box display="flex" alignItems="center">
                            <EmailIcon sx={{ mr: 1 }} />
                            Email
                          </Box>
                        </MenuItem>
                        <MenuItem value="sms">
                          <Box display="flex" alignItems="center">
                            <PhoneIcon sx={{ mr: 1 }} />
                            SMS
                          </Box>
                        </MenuItem>
                        <MenuItem value="both">
                          <Box display="flex" alignItems="center">
                            <EmailIcon sx={{ mr: 1 }} />
                            <PhoneIcon sx={{ mr: 1 }} />
                            Both
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                    
                    {notificationForm.type === 'email' && (
                      <TextField
                        fullWidth
                        label="Email Subject"
                        name="emailSubject"
                        value={notificationForm.emailSubject}
                        onChange={handleFormChange}
                        margin="normal"
                        required
                        disabled={sendingNotification}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    )}
                    
                    {notificationForm.type === 'sms' && (
                      <TextField
                        fullWidth
                        label="SMS Message"
                        name="smsMessage"
                        value={notificationForm.smsMessage}
                        onChange={handleFormChange}
                        margin="normal"
                        multiline
                        rows={2}
                        required
                        helperText="SMS messages are limited to 160 characters"
                        disabled={sendingNotification}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    )}
                    
                    {notificationForm.type === 'both' && (
                      <>
                        <TextField
                          fullWidth
                          label="Email Subject"
                          name="emailSubject"
                          value={notificationForm.emailSubject}
                          onChange={handleFormChange}
                          margin="normal"
                          required
                          disabled={sendingNotification}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="SMS Message"
                          name="smsMessage"
                          value={notificationForm.smsMessage}
                          onChange={handleFormChange}
                          margin="normal"
                          multiline
                          rows={2}
                          required
                          helperText="SMS messages are limited to 160 characters"
                          disabled={sendingNotification}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </>
                    )}
                    
                    <TextField
                      fullWidth
                      label="Schedule For (Optional)"
                      name="scheduledFor"
                      type="datetime-local"
                      value={notificationForm.scheduledFor}
                      onChange={handleFormChange}
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      disabled={sendingNotification}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        disabled={sendingNotification}
                        endIcon={<ArrowForwardIcon />}
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                        }}
                      >
                        Next
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>Select Recipients</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={sendingNotification}
                        startIcon={<ArrowBackIcon />}
                        sx={{ mb: 2 }}
                      >
                        Back
                      </Button>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Choose who will receive this notification
                      </Typography>
                    </Box>
                    
                    <Tabs
                      value={recipientTab}
                      onChange={handleTabChange}
                      aria-label="recipient tabs"
                      sx={{ 
                        mb: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Tab 
                        icon={<PersonIcon />} 
                        label="Students" 
                        iconPosition="start"
                      />
                      <Tab 
                        icon={<GroupIcon />} 
                        label="Registered Users" 
                        iconPosition="start"
                      />
                    </Tabs>
                    
                    {recipientTab === 0 ? (
                      <>
                        <TextField
                          fullWidth
                          label="Search Students"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          margin="normal"
                          placeholder="Search by name, email, or roll number"
                          disabled={sendingNotification}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                        
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                                onChange={handleSelectAllStudents}
                                disabled={sendingNotification || filteredStudents.length === 0}
                              />
                            }
                            label="Select All"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {selectedStudents.length} students selected
                          </Typography>
                        </Box>
                        
                        {filteredStudents.length === 0 ? (
                          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                            No students found. Try adjusting your search criteria.
                          </Alert>
                        ) : (
                          <TableContainer 
                            component={Paper} 
                            sx={{ 
                              maxHeight: 400,
                              borderRadius: 2,
                              boxShadow: 2,
                            }}
                          >
                            <Table stickyHeader size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                      indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                                      onChange={handleSelectAllStudents}
                                      disabled={sendingNotification || filteredStudents.length === 0}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Roll Number</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Pending Amount</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filteredStudents.map((student) => {
                                  const pendingBill = pendingBills.find(
                                    (bill) => bill.student._id === student._id
                                  );
                                  return (
                                    <TableRow 
                                      key={student._id}
                                      hover
                                      sx={{ 
                                        '&:nth-of-type(odd)': { 
                                          backgroundColor: alpha(theme.palette.action.hover, 0.05) 
                                        },
                                      }}
                                    >
                                      <TableCell padding="checkbox">
                                        <Checkbox
                                          checked={selectedStudents.includes(student._id)}
                                          onChange={() => handleStudentSelect(student._id)}
                                          disabled={sendingNotification}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Box display="flex" alignItems="center">
                                          <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 1, width: 32, height: 32 }}>
                                            {student.name.charAt(0)}
                                          </Avatar>
                                          {student.name}
                                        </Box>
                                      </TableCell>
                                      <TableCell>{student.rollNumber}</TableCell>
                                      <TableCell>{student.email}</TableCell>
                                      <TableCell>
                                        {student.phoneNumber ? (
                                          <Box display="flex" alignItems="center">
                                            <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                            {student.phoneNumber}
                                          </Box>
                                        ) : (
                                          <Chip 
                                            label="No phone" 
                                            size="small" 
                                            variant="outlined" 
                                            color="default"
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {pendingBill ? (
                                          <Chip 
                                            label={`₹${pendingBill.totalAmount}`} 
                                            color="warning" 
                                            size="small"
                                            icon={<PaymentIcon />}
                                          />
                                        ) : (
                                          <Chip 
                                            label="No pending bills" 
                                            color="success" 
                                            size="small"
                                            variant="outlined"
                                          />
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </>
                    ) : (
                      <>
                        <TextField
                          fullWidth
                          label="Search Users"
                          value={userSearchTerm}
                          onChange={handleUserSearchChange}
                          margin="normal"
                          placeholder="Search by name, email, or phone number"
                          disabled={sendingNotification}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                        
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedUsers.length === filteredUsers.length}
                                indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                                onChange={handleSelectAllUsers}
                                disabled={sendingNotification}
                              />
                            }
                            label="Select All"
                          />
                          <Typography variant="body2" color="text.secondary">
                            {selectedUsers.length} users selected
                          </Typography>
                        </Box>
                        
                        <TableContainer 
                          component={Paper} 
                          sx={{ 
                            maxHeight: 400,
                            borderRadius: 2,
                            boxShadow: 2,
                          }}
                        >
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={selectedUsers.length === filteredUsers.length}
                                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                                    onChange={handleSelectAllUsers}
                                    disabled={sendingNotification}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredUsers.map((user) => (
                                <TableRow 
                                  key={user._id}
                                  hover
                                  sx={{ 
                                    '&:nth-of-type(odd)': { 
                                      backgroundColor: alpha(theme.palette.action.hover, 0.05) 
                                    },
                                  }}
                                >
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={selectedUsers.includes(user._id)}
                                      onChange={() => handleUserSelect(user._id)}
                                      disabled={sendingNotification}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Box display="flex" alignItems="center">
                                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 1, width: 32, height: 32 }}>
                                        {user.name.charAt(0)}
                                      </Avatar>
                                      {user.name}
                                    </Box>
                                  </TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    {user.phoneNumber ? (
                                      <Box display="flex" alignItems="center">
                                        <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                        {user.phoneNumber}
                                      </Box>
                                    ) : (
                                      <Chip 
                                        label="No phone" 
                                        size="small" 
                                        variant="outlined" 
                                        color="default"
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={user.role}
                                      color={user.role === 'admin' ? 'error' : 'primary'}
                                      size="small"
                                      icon={user.role === 'admin' ? <BusinessIcon /> : <AccountCircleIcon />}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={sendingNotification}
                        startIcon={<ArrowBackIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendNotification}
                        disabled={sendingNotification || (selectedStudents.length === 0 && selectedUsers.length === 0)}
                        startIcon={<SendIcon />}
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                        }}
                      >
                        {sendingNotification ? <CircularProgress size={24} /> : 'Send Notification'}
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Tabs
                value={recipientTab}
                onChange={handleTabChange}
                aria-label="recipient tabs"
                sx={{ 
                  mb: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Tab 
                  icon={<PersonIcon />} 
                  label="Students" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<GroupIcon />} 
                  label="Registered Users" 
                  iconPosition="start"
                />
              </Tabs>
              
              {recipientTab === 0 ? (
                <>
                  <TextField
                    fullWidth
                    label="Search Students"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    margin="normal"
                    placeholder="Search by name, email, or roll number"
                    disabled={sendingNotification}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                          onChange={handleSelectAllStudents}
                          disabled={sendingNotification || filteredStudents.length === 0}
                        />
                      }
                      label="Select All"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {selectedStudents.length} students selected
                    </Typography>
                  </Box>
                  
                  {filteredStudents.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                      No students found. Try adjusting your search criteria.
                    </Alert>
                  ) : (
                    <TableContainer 
                      component={Paper} 
                      sx={{ 
                        maxHeight: 400,
                        borderRadius: 2,
                        boxShadow: 2,
                      }}
                    >
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                                onChange={handleSelectAllStudents}
                                disabled={sendingNotification || filteredStudents.length === 0}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Roll Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Pending Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredStudents.map((student) => {
                            const pendingBill = pendingBills.find(
                              (bill) => bill.student._id === student._id
                            );
                            return (
                              <TableRow 
                                key={student._id}
                                hover
                                sx={{ 
                                  '&:nth-of-type(odd)': { 
                                    backgroundColor: alpha(theme.palette.action.hover, 0.05) 
                                  },
                                }}
                              >
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={selectedStudents.includes(student._id)}
                                    onChange={() => handleStudentSelect(student._id)}
                                    disabled={sendingNotification}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 1, width: 32, height: 32 }}>
                                      {student.name.charAt(0)}
                                    </Avatar>
                                    {student.name}
                                  </Box>
                                </TableCell>
                                <TableCell>{student.rollNumber}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>
                                  {student.phoneNumber ? (
                                    <Box display="flex" alignItems="center">
                                      <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                      {student.phoneNumber}
                                    </Box>
                                  ) : (
                                    <Chip 
                                      label="No phone" 
                                      size="small" 
                                      variant="outlined" 
                                      color="default"
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {pendingBill ? (
                                    <Chip 
                                      label={`₹${pendingBill.totalAmount}`} 
                                      color="warning" 
                                      size="small"
                                      icon={<PaymentIcon />}
                                    />
                                  ) : (
                                    <Chip 
                                      label="No pending bills" 
                                      color="success" 
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Search Users"
                    value={userSearchTerm}
                    onChange={handleUserSearchChange}
                    margin="normal"
                    placeholder="Search by name, email, or phone number"
                    disabled={sendingNotification}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length}
                          indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                          onChange={handleSelectAllUsers}
                          disabled={sendingNotification}
                        />
                      }
                      label="Select All"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {selectedUsers.length} users selected
                    </Typography>
                  </Box>
                  
                  <TableContainer 
                    component={Paper} 
                    sx={{ 
                      maxHeight: 400,
                      borderRadius: 2,
                      boxShadow: 2,
                    }}
                  >
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedUsers.length === filteredUsers.length}
                              indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                              onChange={handleSelectAllUsers}
                              disabled={sendingNotification}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow 
                            key={user._id}
                            hover
                            sx={{ 
                              '&:nth-of-type(odd)': { 
                                backgroundColor: alpha(theme.palette.action.hover, 0.05) 
                              },
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => handleUserSelect(user._id)}
                                disabled={sendingNotification}
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 1, width: 32, height: 32 }}>
                                  {user.name.charAt(0)}
                                </Avatar>
                                {user.name}
                              </Box>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {user.phoneNumber ? (
                                <Box display="flex" alignItems="center">
                                  <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                  {user.phoneNumber}
                                </Box>
                              ) : (
                                <Chip 
                                  label="No phone" 
                                  size="small" 
                                  variant="outlined" 
                                  color="default"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                color={user.role === 'admin' ? 'error' : 'primary'}
                                size="small"
                                icon={user.role === 'admin' ? <BusinessIcon /> : <AccountCircleIcon />}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToForm}
                  disabled={sendingNotification}
                  startIcon={<ArrowBackIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendNotification}
                  disabled={sendingNotification || (selectedStudents.length === 0 && selectedUsers.length === 0)}
                  startIcon={<SendIcon />}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                  }}
                >
                  {sendingNotification ? <CircularProgress size={24} /> : 'Send Notification'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        {!showStudentSelector && (
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button 
              onClick={handleCloseDialog} 
              disabled={sendingNotification}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShowStudentSelector}
              variant="contained"
              color="primary"
              disabled={sendingNotification}
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              Next
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default NotificationsManager; 