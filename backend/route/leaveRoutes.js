const express = require('express');
const router = express.Router();
const leaveController = require('../controller/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const paginationMiddleware = require('../middleware/paginationMiddleware');
const {
    validateApplyLeave,
    validateLeaveReport,
    validateLeaveId,
} = require('../utils/validationHelper');

router.use(authMiddleware);

// any logged in employee
router.post('/apply',
    validateApplyLeave,
    validationMiddleware,
    leaveController.applyLeave
);

router.get('/my-leaves',
    paginationMiddleware,
    leaveController.getMyLeaves
);

router.get('/balance', leaveController.getLeaveBalance);

router.delete('/cancel/:id',
    validateLeaveId,
    validationMiddleware,
    leaveController.cancelLeave
);

// admin, hr and manager
router.get('/',
    roleMiddleware('admin', 'hr', 'manager'),
    paginationMiddleware,
    leaveController.getAllLeaves
);

router.patch('/:id/approve',
    roleMiddleware('admin', 'hr', 'manager'),
    validateLeaveId,
    validationMiddleware,
    leaveController.approveLeave
);

router.patch('/:id/reject',
    roleMiddleware('admin', 'hr', 'manager'),
    validateLeaveId,
    validationMiddleware,
    leaveController.rejectLeave
);

router.get('/report',
    roleMiddleware('admin', 'hr'),
    validateLeaveReport,
    validationMiddleware,
    leaveController.getLeaveReport
);

module.exports = router;