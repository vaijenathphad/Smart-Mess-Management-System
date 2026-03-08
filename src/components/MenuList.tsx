import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Divider,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
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

interface MenuFormData {
  day: string;
  meals: {
    breakfast: MenuItem;
    lunch: MenuItem;
    dinner: MenuItem;
  };
}

const MenuList: React.FC = () => {
  const { token, user } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    day: 'Monday',
    meals: {
      breakfast: { items: [], time: '8:00 AM' },
      lunch: { items: [], time: '1:00 PM' },
      dinner: { items: [], time: '7:00 PM' }
    }
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/menu', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch menus');
      }

      const data = await response.json();
      setMenus(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching menus:', err);
      setError('Failed to load menus. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setSelectedMenu(menu);
      setFormData({
        day: menu.day,
        meals: menu.meals
      });
    } else {
      setSelectedMenu(null);
      setFormData({
        day: 'Monday',
        meals: {
          breakfast: { items: [], time: '8:00 AM' },
          lunch: { items: [], time: '1:00 PM' },
          dinner: { items: [], time: '7:00 PM' }
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMenu(null);
    setFormErrors({});
  };

  const handleChange = (mealType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: {
          ...prev.meals[mealType as keyof typeof prev.meals],
          [field]: value
        }
      }
    }));
    // Clear error when field is edited
    if (formErrors[`${mealType}.${field}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${mealType}.${field}`];
        return newErrors;
      });
    }
  };

  const handleItemsChange = (mealType: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
    handleChange(mealType, 'items', items);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.day) {
      errors.day = 'Day is required';
    }
    
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      if (!formData.meals[mealType as keyof typeof formData.meals].time) {
        errors[`${mealType}.time`] = 'Time is required';
      }
      
      if (formData.meals[mealType as keyof typeof formData.meals].items.length === 0) {
        errors[`${mealType}.items`] = 'At least one item is required';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const url = selectedMenu 
        ? `http://localhost:5000/api/menu/${selectedMenu.day}`
        : 'http://localhost:5000/api/menu';
      
      const method = selectedMenu ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save menu');
      }
      
      await fetchMenus();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving menu:', err);
      setError(err instanceof Error ? err.message : 'Failed to save menu');
    }
  };

  const handleDelete = async (day: string) => {
    if (!window.confirm(`Are you sure you want to delete the menu for ${day}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/menu/${day}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete menu');
      }
      
      await fetchMenus();
    } catch (err) {
      console.error('Error deleting menu:', err);
      setError('Failed to delete menu');
    }
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
          Mess Menu Management
        </Typography>
        {user?.isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Menu
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexWrap="wrap" gap={3}>
        {days.map(day => {
          const menu = menus.find(m => m.day === day);
          
          return (
            <Card key={day} sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {day}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {menu ? (
                  <>
                    <Box mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Breakfast
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">{menu.meals.breakfast.time}</Typography>
                      </Box>
                      <Typography variant="body2">
                        {getItemsString(menu.meals.breakfast.items)}
                      </Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Lunch
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">{menu.meals.lunch.time}</Typography>
                      </Box>
                      <Typography variant="body2">
                        {getItemsString(menu.meals.lunch.items)}
                      </Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Dinner
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">{menu.meals.dinner.time}</Typography>
                      </Box>
                      <Typography variant="body2">
                        {getItemsString(menu.meals.dinner.items)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No menu available for this day
                  </Typography>
                )}
              </CardContent>
              
              {user?.isAdmin && (
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(menu)}
                  >
                    Edit
                  </Button>
                  {menu && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(day)}
                    >
                      Delete
                    </Button>
                  )}
                </CardActions>
              )}
            </Card>
          );
        })}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMenu ? `Edit Menu for ${selectedMenu.day}` : 'Add New Menu'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              label="Day"
              fullWidth
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              margin="normal"
              error={!!formErrors.day}
              helperText={formErrors.day}
              SelectProps={{
                native: true,
              }}
            >
              {days.map(day => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </TextField>

            {['breakfast', 'lunch', 'dinner'].map(mealType => (
              <Box key={mealType} sx={{ mt: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
                  {mealType}
                </Typography>
                
                <TextField
                  label="Time"
                  fullWidth
                  value={formData.meals[mealType as keyof typeof formData.meals].time}
                  onChange={(e) => handleChange(mealType, 'time', e.target.value)}
                  margin="normal"
                  error={!!formErrors[`${mealType}.time`]}
                  helperText={formErrors[`${mealType}.time`]}
                />
                
                <TextField
                  label="Items (comma separated)"
                  fullWidth
                  value={formData.meals[mealType as keyof typeof formData.meals].items.join(', ')}
                  onChange={(e) => handleItemsChange(mealType, e.target.value)}
                  margin="normal"
                  error={!!formErrors[`${mealType}.items`]}
                  helperText={formErrors[`${mealType}.items`] || 'Enter items separated by commas'}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedMenu ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuList; 