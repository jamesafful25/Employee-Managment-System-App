const express = require('express');
const router = express.Router();
const leaveTypeController = require('../controller/leaveTypeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const {
    validateCreateLeaveType,
    validateUpdateLeaveType,
    validateEmployeeId,
} = require('../utils/validationHelper');

router.use(authMiddleware);

// any logged in employee can view leave types
router.get('/', leaveTypeController.getAllLeaveTypes);

router.get('/:id',
    ...validateEmployeeId,
    validationMiddleware,
    leaveTypeController.getLeaveTypeById
);

// admin only
router.post('/',
    roleMiddleware('admin'),
    ...validateCreateLeaveType,
    validationMiddleware,
    leaveTypeController.createLeaveType
);

router.put('/:id',
    roleMiddleware('admin'),
    ...validateCreateLeaveType,
    validationMiddleware,
    leaveTypeController.updateLeaveType
);

router.delete('/:id',
    roleMiddleware('admin'),
    validateEmployeeId,
    validationMiddleware,
    leaveTypeController.deleteLeaveType
);

module.exports = router;