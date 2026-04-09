const leaveService = require('../service/leaveService');

const applyLeave = async(req, res, next) => {
    try {
        const leave = await leaveService.applyLeave(req.employee.id, req.body);
        res.status(201).json({
            status: 'success',
            message: 'Leave application submitted successfully',
            data: leave,
        });
    } catch (err) {
        next(err);
    }
};

const approveLeave = async(req, res, next) => {
    try {
        const leave = await leaveService.approveLeave(req.params.id, req.employee.id);
        res.status(200).json({
            status: 'success',
            message: 'Leave approved successfully',
            data: leave,
        });
    } catch (err) {
        next(err);
    }
};

const rejectLeave = async(req, res, next) => {
    try {
        const leave = await leaveService.rejectLeave(req.params.id, req.employee.id);
        res.status(200).json({
            status: 'success',
            message: 'Leave rejected successfully',
            data: leave,
        });
    } catch (err) {
        next(err);
    }
};

const cancelLeave = async(req, res, next) => {
    try {
        await leaveService.cancelLeave(req.params.id, req.employee.id);
        res.status(200).json({
            status: 'success',
            message: 'Leave cancelled successfully',
        });
    } catch (err) {
        next(err);
    }
};

const getMyLeaves = async(req, res, next) => {
    try {
        const result = await leaveService.getMyLeaves(req.employee.id, req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getAllLeaves = async(req, res, next) => {
    try {
        const result = await leaveService.getAllLeaves(req.query);
        res.status(200).json({
            status: 'success',
            data: result.data,
            meta: result.meta,
        });
    } catch (err) {
        next(err);
    }
};

const getLeaveBalance = async(req, res, next) => {
    try {
        const balance = await leaveService.getLeaveBalance(req.employee.id);
        res.status(200).json({
            status: 'success',
            data: balance,
        });
    } catch (err) {
        next(err);
    }
};

const getLeaveReport = async(req, res, next) => {
    try {
        const report = await leaveService.getLeaveReport(req.query);
        res.status(200).json({
            status: 'success',
            data: report
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    applyLeave,
    approveLeave,
    rejectLeave,
    cancelLeave,
    getMyLeaves,
    getAllLeaves,
    getLeaveBalance,
    getLeaveReport,
};