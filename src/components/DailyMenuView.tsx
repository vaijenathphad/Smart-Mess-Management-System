import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { AccessTime as TimeIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface MenuItem {
  items: string[];
  time: string;
}

interface Menu {
  _id: string;
  day: string;
  meals: {
    breakfast: MenuItem;
    lunch: MenuItem;
    dinner: MenuItem;
  };
  createdAt: string;
  updatedAt: string;
}

const DailyMenuView: React.FC = () => {
  const { token } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string>(getCurrentDay());
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Function to get the current day of the week
  function getCurrentDay(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    return days[today];
  }

  useEffect(() => {
    fetchMenuForDay(selectedDay);
  }, [selectedDay]);

  const fetchMenuForDay = async (day: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/menu/${day}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setMenu(null);
          setError(null);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch menu');
      }

      const data = await response.json();
      setMenu(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Failed to load menu. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (event: SelectChangeEvent<string>) => {
    setSelectedDay(event.target.value);
  };

  const getItemsString = (items: string[]) => {
    return items.join(', ');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Daily Menu
        </Typography>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="day-select-label">Select Day</InputLabel>
          <Select
            labelId="day-select-label"
            value={selectedDay}
            onChange={handleDayChange}
            label="Select Day"
          >
            {days.map(day => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {menu ? (
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Menu for {menu.day}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box display="flex" flexDirection="column" gap={3}>
              {['breakfast', 'lunch', 'dinner'].map(mealType => (
                <Paper key={mealType} elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 2 }}>
                    {mealType}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {menu.meals[mealType as keyof typeof menu.meals].time}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {menu.meals[mealType as keyof typeof menu.meals].items.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No menu available for {selectedDay}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DailyMenuView; 