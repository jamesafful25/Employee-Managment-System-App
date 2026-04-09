const performanceService = require('../service/performanceService');
const { AppError } = require('../utils/errorHandler');
const isValidDateFormat = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

const createReview = async(req, res, next) => {
    try {
        const review = await performanceService.createReview(req.employee.id, req.body);
        res.status(201).json({
            status: 'success',
            message: 'Performance review created successfully',
            data: review,
        });
    } catch (err) {
        next(err);
    }
};

const getMyPerformance = async(req, res, next) => {
    try {
        const result = await performanceService.getMyPerformance(req.employee.id, req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            averageRating: result.averageRating,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getEmployeePerformance = async(req, res, next) => {
    try {
        const result = await performanceService.getEmployeePerformance(req.params.id, req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            averageRating: result.averageRating,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getAllPerformance = async(req, res, next) => {
    try {
        const result = await performanceService.getAllPerformance(req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const updateReview = async(req, res, next) => {
    try {
        const review = await performanceService.updateReview(req.params.id, req.employee.id, req.body);
        res.status(200).json({
            status: 'success',
            message: 'Performance review updated successfully',
            data: review,
        });
    } catch (err) {
        next(err);
    }
};

const deleteReview = async(req, res, next) => {
    try {
        await performanceService.deleteReview(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Performance review deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};


const getPerformanceReport = async(req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return next(new AppError('startDate and endDate are required', 400));
        }

        if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
            return next(new AppError('Date must be in YYYY-MM-DD format', 400));
        }

        if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
            return next(new AppError('Invalid date value', 400));
        }

        const report = await performanceService.getPerformanceReport(req.query);
        res.status(200).json({
            status: 'success',
            data: report,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createReview,
    getMyPerformance,
    getEmployeePerformance,
    getAllPerformance,
    updateReview,
    deleteReview,
    getPerformanceReport,
};