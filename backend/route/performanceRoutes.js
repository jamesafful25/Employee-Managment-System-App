const express = require('express');
const router = express.Router();
const performanceController = require('../controller/performanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const paginationMiddleware = require('../middleware/paginationMiddleware');
const {
    validateCreateReview,
    validateUpdateReview,
    validatePerformanceReport,
    validateEmployeeId,
    validateReviewId
} = require('../utils/validationHelper');

router.use(authMiddleware);

// any logged in employee
router.get('/my-performance',
    paginationMiddleware,
    performanceController.getMyPerformance
);

// admin, hr and manager
router.post('/',
    roleMiddleware('admin', 'hr', 'manager'),
    validateCreateReview,
    validationMiddleware,
    performanceController.createReview
);

router.get('/',
    roleMiddleware('admin', 'hr', 'manager'),
    paginationMiddleware,
    performanceController.getAllPerformance
);

router.get('/employee/:id',
    roleMiddleware('admin', 'hr', 'manager'),
    validateEmployeeId,
    validationMiddleware,
    paginationMiddleware,
    performanceController.getEmployeePerformance
);

router.put('/:id',
    roleMiddleware('admin', 'hr', 'manager'),
    validateReviewId,
    validateUpdateReview,
    validationMiddleware,
    performanceController.updateReview
);

// admin only
router.delete('/:id',
    roleMiddleware('admin'),
    validateReviewId,
    validationMiddleware,
    performanceController.deleteReview
);

router.get('/report',
    roleMiddleware('admin', 'hr'),
    validatePerformanceReport,
    validationMiddleware,
    performanceController.getPerformanceReport
);

module.exports = router;