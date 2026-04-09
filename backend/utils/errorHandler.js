class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

const handleCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);
const handleDuplicateFields = (err) => new AppError(`Duplicate field: ${err.keyValue}`, 400);
const handleValidationError = (err) => {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(`Validation failed: ${messages.join(', ')}`, 400);
};
const handleJWTError = () => new AppError('Invalid token, please log in again', 401);
const handleJWTExpired = () => new AppError('Token expired, please log in again', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message,
        stack: err.stack,
        error: err,
    });
};

const sendErrorProd = (err, res) => {
    // operational errors: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    // programming/unknown errors: don't leak details
    console.error('UNEXPECTED ERROR:', err);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
    });
};

const globalErrorHandler = (err, req, res, next) => {
    let error = {...err, message: err.message };

    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateFields(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpired();

    if (process.env.NODE_ENV === 'development') return sendErrorDev(error, res);
    sendErrorProd(error, res);
};

module.exports = { AppError, globalErrorHandler };