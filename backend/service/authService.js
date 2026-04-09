const { Employee, TokenBlacklist } = require('../model');
const { generateToken, verifyToken } = require('../utils/tokenHelper');
const { AppError } = require('../utils/errorHandler');
const { hashPassword, comparePassword, generateTemporaryPassword } = require('../utils/passwordHelper');
const { sendWelcomeEmail, sendPasswordResetEmail, sendForgotPasswordEmail } = require('./emailService');
const crypto = require('crypto');

// register a new employee
const registerEmployee = async(data) => {
    const existing = await Employee.findOne({ where: { email: data.email } });
    if (existing) throw new AppError('Email already registered', 409);

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    const newEmployee = await Employee.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        department_id: data.department_id || null,
        position: data.position,
        role: data.role,
        hire_date: data.hire_date || null,
        is_password_changed: false,
    });

    try {
        await sendWelcomeEmail(newEmployee, temporaryPassword);
    } catch (emailErr) {
        console.error('Welcome email failed:', emailErr.message);
    }

    const { password, ...employeeData } = newEmployee.toJSON();
    return employeeData;
};


// logout
const logout = async(token) => {
    const existing = await TokenBlacklist.findOne({ where: { token } });
    if (existing) throw new AppError('Already logged out', 400);

    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (err) {
        throw new AppError('Invalid or expired token', 401);
    }

    await TokenBlacklist.create({
        token,
        expires_at: new Date(decoded.exp * 1000),
    });
};

// change password
const changePassword = async(employeeId, currentPassword, newPassword) => {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);

    const isMatch = await comparePassword(currentPassword, employee.password);
    if (!isMatch) throw new AppError('Current password is incorrect', 401);

    employee.password = await hashPassword(newPassword);
    employee.is_password_changed = true;
    await employee.save();
};

// Reset password (admin only) 
const resetPassword = async(employeeId) => {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);

    const temporaryPassword = generateTemporaryPassword();
    employee.password = await hashPassword(temporaryPassword);
    employee.is_password_changed = false;
    await employee.save();

    await sendPasswordResetEmail(employee, temporaryPassword);
};

//forgot Password
const forgotPassword = async(email) => {
    const employee = await Employee.findOne({ where: { email } });

    if (!employee) return;

    // generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // hash token before saving (security best practice)
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    employee.reset_password_token = hashedToken;
    employee.reset_password_expires = Date.now() + 15 * 60 * 1000; // 15 mins

    await employee.save();

    // create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendForgotPasswordEmail(employee, resetLink);
};


//Reseting of forgot password
const resetForgotPassword = async(token, newPassword) => {

    //validation
    if (!newPassword || newPassword.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400);
    }

    // hash incoming token to compare
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const employee = await Employee.findOne({
        where: {
            reset_password_token: hashedToken,
            reset_password_expires: {
                [require('sequelize').Op.gt]: Date.now()
            },
        },
    });

    if (!employee) {
        throw new AppError('Token is invalid or expired', 400);
    }

    // update password
    employee.password = await hashPassword(newPassword);

    // clear token
    employee.reset_password_token = null;
    employee.reset_password_expires = null;

    employee.is_password_changed = true;

    await employee.save();
};

module.exports = {
    registerEmployee,
    logout,
    changePassword,
    resetPassword,
    forgotPassword,
    resetForgotPassword
};