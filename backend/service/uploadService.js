const { File } = require('../model');
const { AppError } = require('../utils/errorHandler');

//uploading of a file
const uploadFile = async(file, userId) => {
    if (!file) {
        throw new AppError('No file uploaded', 400);
    }
    const savedFile = await File.create({
        file_name: file.filename,
        file_path: `uploads/${file.filename}`,
        file_type: file.mimetype,
        file_size: file.size,
        uploaded_by: userId,
        original_name: file.originalname,
    });

    return savedFile;
};

module.exports = { uploadFile };