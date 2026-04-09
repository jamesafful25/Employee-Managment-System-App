const express = require('express');
const router = express.Router();
const payrollController = require('../controller/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const paginationMiddleware = require('../middleware/paginationMiddleware');
const {
    validateGeneratePayroll,
    validateUpdatePayroll,
    validatePayrollReport,
    validateEmployeeId,
    validatePayrollId,
} = require('../utils/validationHelper');

router.use(authMiddleware);

// any logged in employee
router.get('/my-payroll',
    paginationMiddleware,
    payrollController.getMyPayroll
);

// admin and hr only
router.post('/generate',
    roleMiddleware('admin', 'hr'),
    validateGeneratePayroll,
    validationMiddleware,
    payrollController.generatePayroll
);

router.get('/',
    roleMiddleware('admin', 'hr'),
    paginationMiddleware,
    payrollController.getAllPayroll
);

router.get('/employee/:id',
    roleMiddleware('admin', 'hr'),
    validateEmployeeId,
    validationMiddleware,
    paginationMiddleware,
    payrollController.getEmployeePayroll
);

router.put('/:id',
    roleMiddleware('admin', 'hr'),
    validateUpdatePayroll,
    validationMiddleware,
    payrollController.updatePayroll
);

router.patch('/:id/mark-paid',
    roleMiddleware('admin', 'hr'),
    validatePayrollId,
    validationMiddleware,
    payrollController.markAsPaid
);

router.get('/report',
    roleMiddleware('admin', 'hr'),
    validatePayrollReport,
    validationMiddleware,
    payrollController.getPayrollReport
);

module.exports = router;