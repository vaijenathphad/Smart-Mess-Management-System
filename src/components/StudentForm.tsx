import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Stack,
  Paper
} from '@mui/material';

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

interface StudentFormProps {
  student: Student | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (studentData: Partial<Student>) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, mode, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    studentId: '',
    roomNumber: '',
    messId: '',
    email: '',
    phone: '',
    department: '',
    year: new Date().getFullYear(),
    isActive: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        studentId: student.studentId,
        roomNumber: student.roomNumber,
        messId: student.messId,
        email: student.email,
        phone: student.phone || '',
        department: student.department || '',
        year: student.year || new Date().getFullYear(),
        isActive: student.isActive
      });
    }
  }, [student]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.studentId?.trim()) {
      newErrors.studentId = 'Student ID is required';
    }
    
    if (!formData.roomNumber?.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }
    
    if (!formData.messId?.trim()) {
      newErrors.messId = 'Mess ID is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  const isViewMode = mode === 'view';
  
  return (
    <Paper elevation={0} sx={{ p: 3, mt: 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isViewMode}
              required
            />
            <TextField
              fullWidth
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              error={!!errors.studentId}
              helperText={errors.studentId}
              disabled={isViewMode}
              required
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Room Number"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              error={!!errors.roomNumber}
              helperText={errors.roomNumber}
              disabled={isViewMode}
              required
            />
            <TextField
              fullWidth
              label="Mess ID"
              name="messId"
              value={formData.messId}
              onChange={handleChange}
              error={!!errors.messId}
              helperText={errors.messId}
              disabled={isViewMode}
              required
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isViewMode}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isViewMode}
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={isViewMode}
            />
            <TextField
              fullWidth
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              disabled={isViewMode}
              inputProps={{ min: 1, max: 4 }}
            />
          </Box>
          
          {!isViewMode && (
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          )}
          
          {!isViewMode && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {mode === 'add' ? 'Add Student' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default StudentForm; 