const passport = require('passport');
const { verifyToken } = require('../utils/tokenHelper');
const { AppError } = require('../utils/errorHandler');
const { Employee, TokenBlacklist } = require('../model');

const authMiddleware = async(req, res, next) => {
    try {
        // get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided, please log in', 401);
        }

        const token = authHeader.split(' ')[1];

        // check if token is blacklisted
        const blacklisted = await TokenBlacklist.findOne({ where: { token } });
        if (blacklisted) throw new AppError('Token is invalid, please log in again', 401);

        // verify token
        const decoded = verifyToken(token);

        // check if employee still exists and is active
        const employee = await Employee.findByPk(decoded.id);
        if (!employee) throw new AppError('Employee no longer exists', 401);
        if (!employee.is_active) throw new AppError('Account deactivated, contact admin', 403);

        // attach employee to request
        req.employee = employee;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = authMiddleware;