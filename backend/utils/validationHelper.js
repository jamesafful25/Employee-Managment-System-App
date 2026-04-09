const { body, param, query } = require('express-validator');


//AUTH VALIDATIONS
const validateRegister = [
    body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),

    body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters'),

    body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Please provide a valid phone number'),

    body('position')
    .trim()
    .notEmpty().withMessage('Position is required'),

    body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'hr', 'manager', 'employee'])
    .withMessage('Role must be admin, hr, manager or employee'),

    body('hire_date')
    .optional()
    .isISO8601().toDate().withMessage('hire_date must be a valid date'),
];

const validateLogin = [
    body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

    body('password')
    .notEmpty().withMessage('Password is required'),
];

const validateChangePassword = [
    body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

    body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain lowercase letter')
    .matches(/[0-9]/).withMessage('Must contain a number')
    .matches(/[@$!%*?&]/).withMessage('Must contain a special character'),

    body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
];

//EMPLOYEE VALIDATIONS
const validateUpdateEmployee = [
    body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),

    body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters'),

    body('phone')
    .optional()
    .trim()
    .isMobilePhone('any').withMessage('Invalid phone number'),

    body('position')
    .optional()
    .trim()
    .notEmpty().withMessage('Position cannot be empty'),

    body('hire_date')
    .optional()
    .isISO8601().toDate().withMessage('hire_date must be valid'),

    body('basic_salary')
    .optional()
    .isFloat({ min: 0 }).withMessage('Basic salary must be a positive number'),
];

const validateChangeRole = [
    body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'hr', 'manager', 'employee'])
    .withMessage('Invalid role'),
];

const validateEmployeeId = [
    param('id')
    .exists().withMessage('Employee id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('Employee id must be a valid integer'),
];


//PAYOLL VALIDATIONS
const validateGeneratePayroll = [
    body('month')
    .notEmpty().withMessage('Month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Invalid month'),

    body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 2000 }).withMessage('Invalid year'),
];

const validatePayrollId = [
    param('id')
    .exists().withMessage('Payroll id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('Payroll id must be a valid integer'),
];

const validateUpdatePayroll = [
    body('basic_salary')
    .optional()
    .isFloat({ min: 0 }).withMessage('Basic salary must be a positive number'),
    body('bonus')
    .optional()
    .isFloat({ min: 0 }).withMessage('Bonus must be a positive number'),
    body('deductions')
    .optional()
    .isFloat({ min: 0 }).withMessage('Deductions must be a positive number'),
    body('tax_rate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
    body('tax_method')
    .optional()
    .isIn(['basic', 'gross']).withMessage('Tax method must be basic or gross'),
    body('status')
    .optional()
    .isIn(['pending', 'processed', 'paid'])
    .withMessage('Invalid payroll status'),
];

const validatePayrollReport = [
    query('month')
    .notEmpty().withMessage('month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
    query('year')
    .notEmpty().withMessage('year is required')
    .isInt({ min: 2000 }).withMessage('Invalid year'),
    query('departmentId')
    .optional()
    .isInt({ min: 1 }).withMessage('departmentId must be valid integer'),
];

//DEPARTMENT VALIDATIONS
const validateCreateDepartment = [
    body('name')
    .trim()
    .notEmpty().withMessage('Department name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters'),
];

const validateDepartmentId = [
    param('id')
    .exists().withMessage('Department id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('Department id must be a valid integer'),
];

const validateUpdateDepartment = [
    body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Invalid department name'),
];

const validateAssignManager = [
    body('employeeId')
    .notEmpty().withMessage('Employee id is required')
    .isInt({ min: 1 }).withMessage('Employee id must be valid integer'),
];

const validateAssignDepartment = [
    body('employeeId')
    .notEmpty().withMessage('Employee id is required')
    .isInt({ min: 1 }).withMessage('Employee id must be valid integer'),
];


//ATTENDANCE VALIDATIONS
const validateLeaveId = [
    param('id')
    .exists()
    .bail()
    .isInt({ min: 1 }).withMessage('Leave id must be valid integer'),
];

const validateAttendanceReport = [
    query('startDate')
    .notEmpty().withMessage('startDate is required')
    .isISO8601().toDate().withMessage('Invalid startDate'),

    query('endDate')
    .notEmpty().withMessage('endDate is required')
    .isISO8601().toDate().withMessage('Invalid endDate')
    .custom((value, { req }) => {
        if (new Date(value) < new Date(req.query.startDate)) {
            throw new Error('endDate must be after startDate');
        }
        return true;
    }),

    query('departmentId')
    .optional()
    .isInt({ min: 1 }).withMessage('departmentId must be valid integer'),
];


//LEAVE VALIDATIONS
const validateApplyLeave = [
    body('leave_type_id')
    .notEmpty()
    .isInt({ min: 1 }).withMessage('Invalid leave type'),

    body('start_date')
    .notEmpty()
    .isISO8601().toDate()
    .custom((value) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const input = new Date(value).setHours(0, 0, 0, 0);

        if (input < today) throw new Error('Start date cannot be in past');
        return true;
    }),

    body('end_date')
    .notEmpty()
    .isISO8601().toDate()
    .custom((value, { req }) => {
        const start = new Date(req.body.start_date).setHours(0, 0, 0, 0);
        const end = new Date(value).setHours(0, 0, 0, 0);

        if (end < start) throw new Error('End date must be after start date');
        return true;
    }),

    body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason too long'),
];

const validateLeaveReport = [
    query('startDate')
    .notEmpty()
    .isISO8601().toDate(),

    query('endDate')
    .notEmpty()
    .isISO8601().toDate()
    .custom((value, { req }) => {
        if (new Date(value) < new Date(req.query.startDate)) {
            throw new Error('endDate must be after startDate');
        }
        return true;
    }),

    query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected']),

    query('departmentId')
    .optional()
    .isInt({ min: 1 }),
];

const validateCreateLeaveType = [
    body('name').notEmpty(),
    body('max_days').isInt(),
];


//PERFORMANCE - REVIEW VALIDATION
const validateReviewId = [
    param('id')
    .exists().withMessage('Review id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('Review id must be a valid integer'),
];

const validateCreateReview = [
    body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),

    body('comments')
    .optional()
    .isString().withMessage('Comments must be a string'),
];

const validateUpdateReview = [
    param('id')
    .isInt().withMessage('Invalid review ID'),
];

const validatePerformanceReport = [
    query('startDate')
    .optional().isISO8601(),

    query('endDate')
    .optional().isISO8601(),
];

const validateReportFormat = [
    query('format')
    .optional()
    .isIn(['pdf', 'excel'])
    .withMessage('Format must be pdf or excel'),
];

const validateForgotPassword = [
    body('email')
    .notEmpty()
    .isEmail().withMessage('Valid email required'),
];

const validateResetPassword = [
    body('token')
    .notEmpty().withMessage('Token is required'),

    body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

module.exports = {
    validateRegister,
    validateLogin,
    validateChangePassword,
    validateForgotPassword,
    validateResetPassword,

    validateUpdateEmployee,
    validateChangeRole,
    validateEmployeeId,

    validateGeneratePayroll,
    validateUpdatePayroll,
    validatePayrollReport,
    validatePayrollId,

    validateCreateDepartment,
    validateUpdateDepartment,
    validateAssignManager,
    validateAssignDepartment,
    validateDepartmentId,

    validateAttendanceReport,

    validateLeaveId,
    validateCreateLeaveType,
    validateApplyLeave,
    validateLeaveReport,

    validateCreateReview,
    validateReviewId,
    validateUpdateReview,
    validatePerformanceReport,
    validateReportFormat
};