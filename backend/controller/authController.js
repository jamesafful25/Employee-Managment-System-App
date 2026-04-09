const passport = require('passport');
const { AppError } = require('../utils/errorHandler');
const { generateToken } = require('../utils/tokenHelper');
const {
    registerEmployee,
    logout,
    changePassword,
    resetPassword,
    forgotPassword,
    resetForgotPassword
} = require('../service/authService');

// register a new employee
const register = async(req, res, next) => {
    try {
        const employee = await registerEmployee(req.body);

        res.status(201).json({
            status: 'success',
            message: 'Employee registered successfully. Login credentials sent to their email.',
            data: employee,
        });
    } catch (err) {
        next(err);
    }
};

// local login
const login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, employee, info) => {
        if (err) return next(err);

        if (!employee) {
            const message = info && info.message ? info.message : 'Login failed';
            return next(new AppError(message, 401));
        }

        const token = generateToken({ id: employee.id, role: employee.role });

        // remove password from response
        const { password: _, ...employeeData } = employee.toJSON();

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token,
            data: employeeData,
        });
    })(req, res, next);
};

// google login

const googleLogin = passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
});

// google callback
const googleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, employee, info) => {
        if (err) return next(err);


        if (!employee) {
            const message = info && info.message ? info.message : 'Login failed';
            return next(new AppError(message, 401));
        }

        const token = generateToken({ id: employee.id, role: employee.role });

        // redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    })(req, res, next);
};

// logout of a user/employee
const logoutEmployee = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }
        const token = authHeader.split(' ')[1];

        await logout(token);

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    } catch (err) {
        next(err);
    }
};

// change password
const changeEmployeePassword = async(req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // check all fields are provided
        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new AppError('currentPassword, newPassword and confirmPassword are required', 400);
        }

        // check new password and confirm password match
        if (newPassword !== confirmPassword) {
            throw new AppError('newPassword and confirmPassword do not match', 400);
        }

        // check new password is not same as current
        if (currentPassword === newPassword) {
            throw new AppError('New password cannot be the same as current password', 400);
        }

        // check password length
        if (newPassword.length < 8) {
            throw new AppError('New password must be at least 8 characters', 400);
        }

        await changePassword(req.employee.id, currentPassword, newPassword);

        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully',
        });
    } catch (err) {
        next(err);
    }
};

// Reset password (admin only) 
const resetEmployeePassword = async(req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) throw new AppError('Employee id is required', 400);

        await resetPassword(id);

        res.status(200).json({
            status: 'success',
            message: 'Password reset successfully. New temporary password sent to employee email.',
        });
    } catch (err) {
        next(err);
    }
};

//  Get current employee 
const getMe = async(req, res, next) => {
    try {
        const { password: _, ...employeeData } = req.employee.toJSON();

        res.status(200).json({
            status: 'success',
            data: employeeData,
        });
    } catch (err) {
        next(err);
    }
};


//forgot Password
const forgotPasswordController = async(req, res, next) => {
    try {
        await forgotPassword(req.body.email);

        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to email',
        });
    } catch (err) {
        next(err);
    }
};

//Reset Password
const resetPasswordController = async(req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        await resetForgotPassword(token, newPassword);

        res.status(200).json({
            status: 'success',
            message: 'Password reset successful',
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
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
};