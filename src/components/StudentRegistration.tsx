import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

interface StudentRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rollNumber: string;
  roomNumber: string;
  phoneNumber: string;
  course: string;
  year: string;
}

const StudentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentRegistrationData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    roomNumber: '',
    phoneNumber: '',
    course: '',
    year: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword ||
        !formData.rollNumber || !formData.roomNumber || !formData.phoneNumber || !formData.course || !formData.year) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          rollNumber: formData.rollNumber,
          roomNumber: formData.roomNumber,
          phoneNumber: formData.phoneNumber,
          course: formData.course,
          year: formData.year,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Please login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom align="center">
          Student Registration
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Room Number"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  select
                  label="Course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="B.Tech">B.Tech</MenuItem>
                  <MenuItem value="M.Tech">M.Tech</MenuItem>
                  <MenuItem value="PhD">PhD</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  select
                  label="Year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="1">First Year</MenuItem>
                  <MenuItem value="2">Second Year</MenuItem>
                  <MenuItem value="3">Third Year</MenuItem>
                  <MenuItem value="4">Fourth Year</MenuItem>
                </TextField>
              </Box>
            </Box>
            <Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </Box>
            <Box>
              <Button
                variant="text"
                fullWidth
                component={RouterLink}
                to="/login"
              >
                Already have an account? Login
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentRegistration; 