const {
    exportAttendanceReport,
    exportLeaveReport,
    exportPayrollReport,
    exportPerformanceReport,
} = require('../service/reportService');
const { AppError } = require('../utils/errorHandler');

// ATTENDANCE REPORT 
const downloadAttendanceReport = async(req, res, next) => {
    try {
        const { startDate, endDate, departmentId, format } = req.query;

        if (!startDate || !endDate) {
            return next(new AppError('startDate and endDate are required', 400));
        }

        await exportAttendanceReport({ startDate, endDate, departmentId },
            format,
            res
        );
    } catch (err) {
        next(err);
    }
};

//LEAVE REPORT 
const downloadLeaveReport = async(req, res, next) => {
    try {
        const { startDate, endDate, departmentId, status, format } = req.query;

        if (!startDate || !endDate) {
            return next(new AppError('startDate and endDate are required', 400));
        }

        await exportLeaveReport({ startDate, endDate, departmentId, status },
            format,
            res
        );
    } catch (err) {
        next(err);
    }
};

//PAYROLL REPORT 
const downloadPayrollReport = async(req, res, next) => {
    try {
        const { month, year, departmentId, format } = req.query;

        if (!month || !year) {
            return next(new AppError('month and year are required', 400));
        }


        await exportPayrollReport({ month, year, departmentId },
            format,
            res
        );
    } catch (err) {
        next(err);
    }
};

//PERFORMANCE REPORT 
const downloadPerformanceReport = async(req, res, next) => {
    try {
        const { startDate, endDate, departmentId, format } = req.query;

        if (!startDate || !endDate) {
            return next(new AppError('startDate and endDate are required', 400));
        }

        await exportPerformanceReport({ startDate, endDate, departmentId },
            format,
            res
        );
    } catch (err) {
        next(err);
    }
};

module.exports = {
    downloadAttendanceReport,
    downloadLeaveReport,
    downloadPayrollReport,
    downloadPerformanceReport,
};