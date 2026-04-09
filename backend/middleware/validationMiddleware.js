const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

const validationMiddleware = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // get all error messages and join them
        const errorMessages = errors.array().map((err) => err.msg);
        return next(new AppError(errorMessages.join(', '), 422));
    }

    next();
};

module.exports = validationMiddleware;