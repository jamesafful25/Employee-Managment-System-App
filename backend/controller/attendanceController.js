const attendanceService = require('../service/attendanceService');

const clockIn = async(req, res, next) => {
    try {
        const attendance = await attendanceService.clockIn(req.employee.id);
        res.status(201).json({
            status: 'success',
            message: 'Clocked in successfully',
            data: attendance,
        });
    } catch (err) {
        next(err);
    }
};

const clockOut = async(req, res, next) => {
    try {
        const attendance = await attendanceService.clockOut(req.employee.id);
        res.status(200).json({
            status: 'success',
            message: 'Clocked out successfully',
            data: attendance,
        });
    } catch (err) {
        next(err);
    }
};

const getMyAttendance = async(req, res, next) => {
    try {
        const result = await attendanceService.getMyAttendance(req.employee.id, req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getEmployeeAttendance = async(req, res, next) => {
    try {
        const result = await attendanceService.getEmployeeAttendance(req.params.id, req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getAllAttendance = async(req, res, next) => {
    try {
        const result = await attendanceService.getAllAttendance(req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getAttendanceReport = async(req, res, next) => {
    try {
        const report = await attendanceService.getAttendanceReport(req.query);
        res.status(200).json({
            status: 'success',
            data: report,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    clockIn,
    clockOut,
    getMyAttendance,
    getEmployeeAttendance,
    getAllAttendance,
    getAttendanceReport,
};