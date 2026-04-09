const { uploadFile } = require('../service/uploadService');
const { AppError } = require('../utils/errorHandler');

const uploadFileHandler = async(req, res, next) => {
    try {
        const file = req.file;

        if (!file) {
            throw new AppError('File is required', 400);
        }

        const savedFile = await uploadFile(file, req.employee.id);

        res.status(201).json({
            status: 'success',
            message: 'File uploaded successfully',
            data: savedFile,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { uploadFileHandler };