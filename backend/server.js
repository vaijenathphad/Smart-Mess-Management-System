const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/mess-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false }
});

const UserModel = mongoose.model('User', userSchema);

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    // You can change these values to set up your admin user
    const adminEmail = 'vaijanath@example.com';
    const adminPassword = '123456';
    const adminName = 'Vaijanath';
    
    const adminExists = await UserModel.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const adminUser = new UserModel({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Call the function to create admin user
createAdminUser();

// Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  messId: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const StudentModel = mongoose.model('Student', studentSchema);

// Bill Schema
const billSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BillModel = mongoose.model('Bill', billSchema);

// Menu Schema
const menuSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  meals: {
    breakfast: {
      items: [String],
      time: String
    },
    lunch: {
      items: [String],
      time: String
    },
    dinner: {
      items: [String],
      time: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
menuSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const MenuModel = mongoose.model('Menu', menuSchema);

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for student and date to prevent duplicate entries
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const AttendanceModel = mongoose.model('Attendance', attendanceSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidAt: {
    type: Date
  }
});

const PaymentModel = mongoose.model('Payment', paymentSchema);

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, 'your_jwt_secret');
    
    // Find user
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin Middleware
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, 'your_jwt_secret');
    
    // Find user
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Student routes - Protected with admin authentication
app.get('/api/students', adminAuth, async (req, res) => {
  try {
    const students = await StudentModel.find().sort({ name: 1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/students/:id', adminAuth, async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/students', adminAuth, async (req, res) => {
  try {
    const { name, studentId, roomNumber, messId, email, phone, department, year, isActive } = req.body;
    
    // Check if student with same ID or email already exists
    const existingStudent = await StudentModel.findOne({ 
      $or: [{ studentId }, { email }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this ID or email already exists' 
      });
    }
    
    const student = new StudentModel({
      name,
      studentId,
      roomNumber,
      messId,
      email,
      phone,
      department,
      year,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/students/:id', adminAuth, async (req, res) => {
  try {
    const { name, studentId, roomNumber, messId, email, phone, department, year, isActive } = req.body;
    
    // Check if student exists
    const student = await StudentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if another student has the same ID or email
    if (studentId !== student.studentId || email !== student.email) {
      const existingStudent = await StudentModel.findOne({ 
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

app.delete('/api/students/:id', adminAuth, async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await StudentModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student profile route - Accessible by authenticated users
app.get('/api/student-profile', auth, async (req, res) => {
  try {
    // In a real application, you would fetch the student profile based on the user's ID
    // For now, we'll return a mock profile
    const studentProfile = {
      name: 'John Doe',
      studentId: 'STU123',
      roomNumber: '101',
      messId: 'MESS001',
      email: 'john.doe@example.com',
      phone: '1234567890',
      department: 'Computer Science',
      year: 3,
      isActive: true
    };
    
    res.json(studentProfile);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Menu routes - Protected with admin authentication for adding/editing
app.get('/api/menu', auth, async (req, res) => {
  try {
    const menus = await MenuModel.find().sort({ day: 1 });
    res.json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/menu/:day', auth, async (req, res) => {
  try {
    const { day } = req.params;
    const menu = await MenuModel.findOne({ day });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found for this day' });
    }
    
    res.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/menu', adminAuth, async (req, res) => {
  try {
    const { day, meals } = req.body;
    
    // Check if menu for this day already exists
    const existingMenu = await MenuModel.findOne({ day });
    if (existingMenu) {
      return res.status(400).json({ message: 'Menu for this day already exists' });
    }
    
    const menu = new MenuModel({
      day,
      meals
    });
    
    await menu.save();
    res.status(201).json(menu);
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/menu/:day', adminAuth, async (req, res) => {
  try {
    const { day } = req.params;
    const { meals } = req.body;
    
    // Check if menu exists
    const menu = await MenuModel.findOne({ day });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found for this day' });
    }
    
    // Update menu
    menu.meals = meals;
    
    await menu.save();
    res.json(menu);
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/menu/:day', adminAuth, async (req, res) => {
  try {
    const { day } = req.params;
    
    // Check if menu exists
    const menu = await MenuModel.findOne({ day });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found for this day' });
    }
    
    await MenuModel.findOneAndDelete({ day });
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Registration route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      isAdmin: false
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Dashboard Route - Protected with authentication
app.get('/api/dashboard', auth, async (req, res) => {
  try {
    // In a real application, you would fetch this data from your database
    // For now, we'll return mock data
    const dashboardData = {
      menu: [
        { id: 1, meal: 'Breakfast', items: 'Oatmeal, Eggs, Toast' },
        { id: 2, meal: 'Lunch', items: 'Rice, Dal, Vegetables' },
        { id: 3, meal: 'Dinner', items: 'Roti, Curry, Salad' },
      ],
      attendance: {
        present: 25,
        absent: 5,
        total: 30,
      },
      dues: {
        paid: 15,
        pending: 10,
        total: 25,
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Special route to create admin user (protected with a secret key)
app.post('/api/create-admin', async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;
    
    // Check for admin key (you should change this to a secure value)
    if (adminKey !== 'mess-admin-secret-key') {
      return res.status(403).json({ message: 'Invalid admin key' });
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new admin user
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      isAdmin: true
    });
    
    await user.save();
    
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ message: 'Server error during admin creation' });
  }
});

// Attendance Routes
// Get attendance for a specific date range
app.get('/api/attendance', auth, async (req, res) => {
  try {
    const { startDate, endDate, studentId } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (studentId) {
      query.student = studentId;
    }

    const attendance = await AttendanceModel.find(query)
      .populate('student', 'name rollNumber')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance manually
app.post('/api/attendance', auth, async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    
    const attendance = new AttendanceModel({
      student: studentId,
      date: new Date(date),
      status,
      markedBy: req.user.id
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark attendance for multiple students
app.post('/api/attendance/bulk', auth, async (req, res) => {
  try {
    const { date, attendanceData } = req.body;
    
    const attendanceRecords = attendanceData.map(record => ({
      student: record.studentId,
      date: new Date(date),
      status: record.status,
      markedBy: req.user.id
    }));

    await AttendanceModel.insertMany(attendanceRecords);
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export attendance report (admin only)
app.get('/api/attendance/export', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await AttendanceModel.find(query)
      .populate('student', 'name rollNumber')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    // Generate CSV data
    const csvData = attendance.map(record => ({
      date: record.date.toISOString().split('T')[0],
      studentName: record.student.name,
      rollNumber: record.student.rollNumber,
      status: record.status,
      markedBy: record.markedBy.name,
      markedAt: record.markedAt.toISOString()
    }));

    res.json(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student Registration Route
app.post('/api/register/student', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      roomNumber,
      phoneNumber,
      course,
      year
    } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if student already exists
    const existingStudent = await StudentModel.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      isAdmin: false
    });
    await user.save();

    // Create student
    const student = new StudentModel({
      user: user._id,
      rollNumber,
      roomNumber,
      phoneNumber,
      course,
      year
    });
    await student.save();

    // Create initial payment record
    const currentDate = new Date();
    const payment = new PaymentModel({
      student: student._id,
      month: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      amount: 5000, // Default monthly mess fee
      status: 'pending',
      dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5) // Due by 5th of next month
    });
    await payment.save();

    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's attendance
app.get('/api/attendance/student', auth, async (req, res) => {
  try {
    const student = await StudentModel.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendance = await AttendanceModel.find({ student: student._id })
      .sort({ date: -1 })
      .limit(30); // Last 30 days

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's payments
app.get('/api/payments/student', auth, async (req, res) => {
  try {
    const student = await StudentModel.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const payments = await PaymentModel.find({ student: student._id })
      .sort({ dueDate: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's menu
app.get('/api/menu/today', auth, async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const menu = await MenuModel.findOne({ day: today });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students with pending bills
app.get('/api/students/pending-bills', adminAuth, async (req, res) => {
  try {
    // Find all bills with pending status
    const pendingBills = await BillModel.find({ status: 'pending' });
    
    // Extract unique student IDs from pending bills
    const studentIds = [...new Set(pendingBills.map(bill => bill.student.toString()))];
    
    // Find all students with pending bills
    const students = await StudentModel.find({ _id: { $in: studentIds } });
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students with pending bills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bills
app.get('/api/bills', auth, async (req, res) => {
  try {
    const bills = await BillModel.find()
      .populate('student', 'name studentId')
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending bills
app.get('/api/bills/pending', auth, async (req, res) => {
  try {
    const pendingBills = await BillModel.find({ status: 'pending' })
      .populate('student', 'name studentId email phoneNumber')
      .sort({ dueDate: 1 });
    res.json(pendingBills);
  } catch (error) {
    console.error('Error fetching pending bills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post bills
app.post('/api/bills', auth, async (req, res) => {
  // Implementation of posting a bill
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 