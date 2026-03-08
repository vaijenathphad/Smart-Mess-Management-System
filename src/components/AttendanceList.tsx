import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useAuth } from '../context/AuthContext';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
}

interface AttendanceRecord {
  _id: string;
  student: Student;
  date: string;
  status: 'present' | 'absent';
  markedBy: {
    name: string;
  };
  markedAt: string;
}

const AttendanceList: React.FC = () => {
  const { user, token } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: 'present' | 'absent' }>({});

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch students');
      setStudents([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      let url = 'http://localhost:5000/api/attendance';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAttendance(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch attendance');
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      if (!selectedDate) return;

      const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const response = await fetch('http://localhost:5000/api/attendance/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          attendanceData: attendanceRecords
        })
      });

      if (response.ok) {
        setSuccess('Attendance marked successfully');
        setOpenDialog(false);
        fetchAttendance();
      } else {
        setError('Failed to mark attendance');
      }
    } catch (error) {
      setError('Failed to mark attendance');
    }
  };

  const handleExportAttendance = async () => {
    try {
      let url = 'http://localhost:5000/api/attendance/export';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      // Convert to CSV
      const headers = ['Date', 'Student Name', 'Roll Number', 'Status', 'Marked By', 'Marked At'];
      const csvContent = [
        headers.join(','),
        ...data.map((record: any) => [
          record.date,
          record.studentName,
          record.rollNumber,
          record.status,
          record.markedBy,
          record.markedAt
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url2 = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url2);
    } catch (error) {
      setError('Failed to export attendance');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Attendance Management</Typography>
        <Box>
          {user?.isAdmin && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(true)}
              sx={{ mr: 2 }}
            >
              Mark Attendance
            </Button>
          )}
          {user?.isAdmin && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportAttendance}
            >
              Export Report
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={fetchAttendance}>
          Filter
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Roll Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Marked By</TableCell>
              <TableCell>Marked At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{record.student.name}</TableCell>
                <TableCell>{record.student.rollNumber}</TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell>{record.markedBy.name}</TableCell>
                <TableCell>{new Date(record.markedAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 2 }}>
            <TextField
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Roll Number</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={attendanceData[student._id] || 'present'}
                          onChange={(e) => setAttendanceData({
                            ...attendanceData,
                            [student._id]: e.target.value as 'present' | 'absent'
                          })}
                        >
                          <MenuItem value="present">Present</MenuItem>
                          <MenuItem value="absent">Absent</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleMarkAttendance} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceList; 