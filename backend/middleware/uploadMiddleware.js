const upload = require('../config/multer');
const { AppError } = require('../utils/errorHandler');
const multer = require('multer');

const uploadSingleFile = (fieldName) => {
    return (req, res, next) => {
        const handler = upload.single(fieldName);

        handler(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return next(new AppError(err.message, 400));
            }

            if (err) {
                return next(new AppError(err.message || 'File upload failed', 400));
            }

            next();
        });
    };
};

module.exports = {
    uploadSingleFile,
};