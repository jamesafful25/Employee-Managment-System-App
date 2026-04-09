const { AppError } = require('../utils/errorHandler');

const roleMiddleware = (...roles) => (req, res, next) => {
    if (!req.employee) {
        return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(req.employee.role)) {
        return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
};

module.exports = roleMiddleware;