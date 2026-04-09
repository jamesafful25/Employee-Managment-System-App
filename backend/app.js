const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

// route imports
const authRoutes = require('./route/authRoutes');
const employeeRoutes = require('./route/employeeRoutes');
const departmentRoutes = require('./route/departmentRoutes');
const attendanceRoutes = require('./route/attendanceRoutes');
const leaveRoutes = require('./route/leaveRoutes');
const leaveTypeRoutes = require('./route/leaveTypeRoutes');
const payrollRoutes = require('./route/payrollRoutes');
const performanceRoutes = require('./route/performanceRoutes');
const reportRoutes = require('./route/reportRoutes');
const uploadRoutes = require('./route/uploadRoutes');

// middleware imports
const passport = require('./config/passport');
const { rateLimiter, authRateLimiter } = require('./middleware/rateLimiterMiddleware');
const errorHandleMiddleware = require('./middleware/errorHandleMiddleware');

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// security + middleware order
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(rateLimiter); // global
app.use(passport.initialize());

// routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/uploads', uploadRoutes);

//express static middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// error handler 
app.use(errorHandleMiddleware);


module.exports = app;