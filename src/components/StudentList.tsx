import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import StudentForm from './StudentForm';

interface Student {
  _id: string;
  name: string;
  studentId: string;
  roomNumber: string;
  messId: string;
  email: string;
  phone: string;
  department: string;
  year: number;
  isActive: boolean;
}

// Mock data for testing
const mockStudents: Student[] = [
  {
    _id: '1',
    name: 'John Doe',
    studentId: 'STU001',
    roomNumber: '101',
    messId: 'MESS001',
    email: 'john.doe@example.com',
    phone: '1234567890',
    department: 'Computer Science',
    year: 2,
    isActive: true
  },
  {
    _id: '2',
    name: 'Jane Smith',
    studentId: 'STU002',
    roomNumber: '102',
    messId: 'MESS001',
    email: 'jane.smith@example.com',
    phone: '9876543210',
    department: 'Electrical Engineering',
    year: 3,
    isActive: true
  },
  {
    _id: '3',
    name: 'Robert Johnson',
    studentId: 'STU003',
    roomNumber: '103',
    messId: 'MESS002',
    email: 'robert.johnson@example.com',
    phone: '5555555555',
    department: 'Mechanical Engineering',
    year: 1,
    isActive: false
  }
];

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/students');
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setStudents(data);
      setUseMockData(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Using mock data instead.');
      setStudents(mockStudents);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setDialogMode('add');
    setSelectedStudent(null);
    setOpenDialog(true);
  };

  const handleEditStudent = (student: Student) => {
    setDialogMode('edit');
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleViewStudent = (student: Student) => {
    setDialogMode('view');
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedStudent(null);
  };

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      if (dialogMode === 'add') {
        // Add new student
        const response = await fetch('http://localhost:5000/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentData),
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const newStudent = await response.json();
        setStudents([...students, newStudent]);
      } else if (dialogMode === 'edit' && selectedStudent) {
        // Update existing student
        const response = await fetch(`http://localhost:5000/api/students/${selectedStudent._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentData),
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const updatedStudent = await response.json();
        setStudents(students.map(student => 
          student._id === updatedStudent._id ? updatedStudent : student
        ));
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving student:', err);
      setError('Failed to save student. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/students/${selectedStudent._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      setStudents(students.filter(student => student._id !== selectedStudent._id));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Student Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddStudent}
        >
          Add Student
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
          {useMockData && (
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchStudents}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          )}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Mess ID</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.roomNumber}</TableCell>
                    <TableCell>{student.messId}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewStudent(student)}
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditStudent(student)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteStudent(student)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit/View Student Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Student' : 
           dialogMode === 'edit' ? 'Edit Student' : 'Student Details'}
        </DialogTitle>
        <DialogContent>
          <StudentForm
            student={selectedStudent}
            mode={dialogMode}
            onSave={handleSaveStudent}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
        {dialogMode === 'view' && (
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedStudent?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentList; 