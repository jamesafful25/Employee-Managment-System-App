const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const departmentController = require('../controller/departmentController');
const validationMiddleware = require('../middleware/validationMiddleware');
const {
    validateCreateDepartment,
    validateUpdateDepartment,
    validateAssignManager,
    validateAssignDepartment,
    validateDepartmentId,
} = require('../utils/validationHelper');

router.use(authMiddleware);

// any logged in employee can view departments
router.get('/', departmentController.getAllDepartments);

router.get('/:id',
    validateDepartmentId,
    validationMiddleware,
    departmentController.getDepartmentById
);

// admin and hr only
router.post('/',
    roleMiddleware('admin', 'hr'),
    validateCreateDepartment,
    validationMiddleware,
    departmentController.createDepartment
);

router.patch('/:id',
    roleMiddleware('admin', 'hr'),
    validateDepartmentId,
    validateUpdateDepartment,
    validationMiddleware,
    departmentController.updateDepartment
);

router.delete('/:id',
    roleMiddleware('admin'),
    validateDepartmentId,
    validationMiddleware,
    departmentController.deleteDepartment
);

router.patch('/:id/assign-manager',
    roleMiddleware('admin', 'hr'),
    validateDepartmentId,
    validateAssignManager,
    validationMiddleware,
    departmentController.assignManager
);

router.patch('/:id/assign-employee',
    roleMiddleware('admin', 'hr'),
    validateDepartmentId,
    validateAssignDepartment,
    validationMiddleware,
    departmentController.assignEmployeeToDept
);

module.exports = router;