const express = require('express');
const router = express.Router();

const {
    register,
    login,
    googleLogin,
    googleCallback,
    logoutEmployee,
    changeEmployeePassword,
    resetEmployeePassword,
    getMe,
    forgotPasswordController,
    resetPasswordController
} = require('../controller/authController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { authRateLimiter } = require('../utils/rateLimiter');

const validationMiddleware = require('../middleware/validationMiddleware');
const {
    validateRegister,
    validateLogin,
    validateChangePassword,
    validateEmployeeId,
    validateForgotPassword,
    validateResetPassword
} = require('../utils/validationHelper');


//public route
router.post('/login',
    authRateLimiter,
    ...validateLogin,
    validationMiddleware,
    login
);

router.get('/google', googleLogin);
router.get('/google/callback', authRateLimiter, googleCallback);

router.post(
    '/forgot-password',
    authRateLimiter,
    validateForgotPassword,
    validationMiddleware,
    forgotPasswordController
);

router.post(
    '/reset-password',
    validateResetPassword,
    validationMiddleware,
    resetPasswordController
);



// protected routes
router.use(authMiddleware);

router.get('/me', getMe);

router.post('/logout', logoutEmployee);

router.patch(
    '/change-password',
    ...validateChangePassword,
    validationMiddleware,
    changeEmployeePassword
);


// Admin / HR only
router.post(
    '/register',
    authRateLimiter,
    roleMiddleware('admin', 'hr'),
    ...validateRegister,
    validationMiddleware,
    register
);

router.patch(
    '/admin/employees/:id/reset-password',
    authRateLimiter,
    roleMiddleware('admin'),
    ...validateEmployeeId,
    validationMiddleware,
    resetEmployeePassword
);

module.exports = router;