const express = require('express');
const router = express.Router();
const {
    downloadAttendanceReport,
    downloadLeaveReport,
    downloadPayrollReport,
    downloadPerformanceReport,
} = require('../controller/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const {
    validateAttendanceReport,
    validateLeaveReport,
    validatePayrollReport,
    validatePerformanceReport,
    validateReportFormat,
} = require('../utils/validationHelper');

// all report routes are protected — admin and hr only
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'hr'));

//attendance report
router.get('/attendance',
    validateAttendanceReport,
    validateReportFormat,
    validationMiddleware,
    downloadAttendanceReport
);

// leave report
router.get('/leave',
    validateLeaveReport,
    validateReportFormat,
    validationMiddleware,
    downloadLeaveReport
);

// payroll report
router.get('/payroll',
    validatePayrollReport,
    validateReportFormat,
    validationMiddleware,
    downloadPayrollReport
);

// performance report
router.get('/performance',
    validatePerformanceReport,
    validateReportFormat,
    validationMiddleware,
    downloadPerformanceReport
);

module.exports = router;