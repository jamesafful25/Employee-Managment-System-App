const express = require('express');
const router = express.Router();

const uploadController = require('../controller/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadSingleFile } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.post(
    '/',
    roleMiddleware('admin', 'hr', 'manager'),
    uploadSingleFile('file'),
    uploadController.uploadFileHandler
);

module.exports = router;