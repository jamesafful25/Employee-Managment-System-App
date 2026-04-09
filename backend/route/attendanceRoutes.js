const express = require('express');
const router = express.Router();
const attendanceController = require('../controller/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const paginationMiddleware = require('../middleware/paginationMiddleware');
const {
    validateAttendanceReport,
    validateEmployeeId,
} = require('../utils/validationHelper');

router.use(authMiddleware);

// any logged in employee
router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);

router.get('/my-attendance',
    paginationMiddleware,
    attendanceController.getMyAttendance
);

// admin and hr only
router.get('/',
    roleMiddleware('admin', 'hr'),
    paginationMiddleware,
    attendanceController.getAllAttendance
);

router.get('/employee/:id',
    roleMiddleware('admin', 'hr'),
    validateEmployeeId,
    validationMiddleware,
    paginationMiddleware,
    attendanceController.getEmployeeAttendance
);

router.get('/report',
    roleMiddleware('admin', 'hr'),
    validateAttendanceReport,
    validationMiddleware,
    attendanceController.getAttendanceReport
);

module.exports = router;