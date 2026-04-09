const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const {
    validateUpdateEmployee,
    validateChangeRole,
    validateEmployeeId,
} = require('../utils/validationHelper');

// all employee routes are protected
router.use(authMiddleware);

// any logged in employee
router.get('/me', employeeController.getMyProfile);

// admin and hr only
router.get('/',
    roleMiddleware('admin', 'hr'),
    employeeController.getAllEmployees
);

router.get('/:id',
    roleMiddleware('admin', 'hr'),
    validateEmployeeId,
    validationMiddleware,
    employeeController.getEmployeeById
);

router.patch('/:id',
    roleMiddleware('admin', 'hr'),
    validateEmployeeId,
    validateUpdateEmployee,
    validationMiddleware,
    employeeController.updateEmployee
);

router.patch('/:id/deactivate',
    roleMiddleware('admin'),
    validateEmployeeId,
    validationMiddleware,
    employeeController.deactivateEmployee
);

router.patch('/:id/activate',
    roleMiddleware('admin'),
    validateEmployeeId,
    validationMiddleware,
    employeeController.activateEmployee
);

router.patch('/:id/role',
    roleMiddleware('admin'),
    validateEmployeeId,
    validateChangeRole,
    validationMiddleware,
    employeeController.changeRole
);

router.delete('/:id',
    roleMiddleware('admin'),
    validateEmployeeId,
    validationMiddleware,
    employeeController.deleteEmployee
);

module.exports = router;