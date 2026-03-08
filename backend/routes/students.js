const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // In a real application, you would check the user's role from the token
  // For now, we'll just check if the user is authenticated
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new student (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, studentId, roomNumber, messId, email, phone, department, year } = req.body;
    
    // Check if student with same ID or email already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ studentId }, { email }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this ID or email already exists' 
      });
    }
    
    const student = new Student({
      name,
      studentId,
      roomNumber,
      messId,
      email,
      phone,
      department,
      year
    });
    
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a student (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, studentId, roomNumber, messId, email, phone, department, year, isActive } = req.body;
    
    // Check if student exists
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if another student has the same ID or email
    if (studentId !== student.studentId || email !== student.email) {
      const existingStudent = await Student.findOne({ 
        $or: [
          { studentId, _id: { $ne: req.params.id } },
          { email, _id: { $ne: req.params.id } }
        ]
      });
      
      if (existingStudent) {
        return res.status(400).json({ 
          message: 'Another student with this ID or email already exists' 
        });
      }
    }
    
    // Update student
    student.name = name || student.name;
    student.studentId = studentId || student.studentId;
    student.roomNumber = roomNumber || student.roomNumber;
    student.messId = messId || student.messId;
    student.email = email || student.email;
    student.phone = phone || student.phone;
    student.department = department || student.department;
    student.year = year || student.year;
    student.isActive = isActive !== undefined ? isActive : student.isActive;
    
    await student.save();
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a student (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 